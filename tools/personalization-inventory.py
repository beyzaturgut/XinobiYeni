#!/usr/bin/env python3
"""Read-only KIS-TEK-02 analyzer. Reads an allowlisted SQL snapshot and local assets; writes only a report."""
import argparse, hashlib, json
from pathlib import Path

def run(repo, snapshot):
    data=repo/'services/api/App_Data/local-commerce'
    web=repo/'apps/web/public'
    def get(rows,key): return {x[key]:x for x in rows}
    products=get(snapshot['products'],'Id');variants=get(snapshot['variants'],'Id')
    prices=get(snapshot['prices'],'VariantId');designs=get(snapshot['designs'],'id')
    def path_under(base, name):
        p=(base/name).resolve()
        if not p.is_relative_to(base.resolve()): return None
        return p
    def source_path(url):
        if not url: return None
        if url.startswith('/api/v1/local-commerce/media/'):
            return path_under(data/'media',url.removeprefix('/api/v1/local-commerce/media/'))
        if url.startswith('/assets/'):return path_under(web,url.lstrip('/'))
        return None
    def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest() if p and p.is_file() else None
    workspace=data/'product-surfaces/workspace.json'
    drafts=json.loads(workspace.read_text()).get('drafts',[]) if workspace.exists() else []
    manifest=json.loads((repo/'fixtures/product-surfaces/xinobi-u-accepted/manifest.json').read_text())['variants']
    published=[json.loads(p.read_text()) for p in sorted((web/'assets/product-previews').glob('*/*/inputs.json'))]
    result={'scope':'configured SQL metadata + local filesystem; not IIS filesystem acceptance','counts':{
        'products':len(products),'variants':len(variants),'prices':len(prices),'savedDesigns':len(designs),
        'configurations':len(snapshot['configurations']),'orders':snapshot['orderCount'],'orderLines':snapshot['orderLineCount'],
        'personalizedLines':len(snapshot['personalizedLines']),'localDrafts':len(drafts),'fixtureEntries':len(manifest),'publishedEntries':len(published)},'products':[]}
    for p in sorted(products.values(),key=lambda p:p['Id']):
        if not p.get('Personalizable'):continue
        vs=sorted([v for v in variants.values() if v['ProductId']==p['Id']],key=lambda v:v['Id'])
        candidates=[]
        for v in vs:
            h=digest(source_path(v.get('Image')))
            candidates.append({'variantId':v['Id'],'sku':v['Sku'],'image':v.get('Image'),'localSourceSha256':h,
                'localSourceAvailable':h is not None,'priceDefined':v['Id'] in prices,'stockPositive':v['Stock']>0,
                'maskState':'none' if not v.get('SurfaceMask') else 'approved-link' if v.get('SurfaceImage')==v.get('Image') else 'stale-link',
                'localMaskAvailable':digest(source_path(v.get('SurfaceMask'))) is not None})
        source_keys={c['localSourceSha256'] or c['image'] for c in candidates if c['image']}
        drafts_for=[x for x in drafts if x['productId']==p['Id']]
        result['products'].append({'productId':p['Id'],'name':p['Name'],'active':p['Active'],'variantCount':len(vs),
            'sourceCandidateCount':len(source_keys),'selectedSource':None,'selectedFulfillmentVariant':None,
            'decision':'manual_review_required' if len(source_keys)!=1 else 'single_candidate_requires_explicit_confirmation',
            'candidates':candidates,'localDraftCount':len(drafts_for),
            'fixtureCount':sum(x['productId']==p['Id'] for x in manifest),
            'publishedCount':sum(x['productReference']==p['Id'] for x in published),
            'savedDesignCount':sum(x.get('productId')==p['Id'] for x in designs.values()),
            'configurationCount':sum(x['value'].get('productId')==p['Id'] for x in snapshot['configurations']),
            'personalizedLineCount':sum(x.get('productId')==p['Id'] for x in snapshot['personalizedLines'])})
    configs=[x['value'] for x in snapshot['configurations']]
    result['relations']={
        'designMissingProduct':sum(x.get('productId') not in products for x in designs.values()),
        'designMissingVariant':sum(bool(x.get('variantId')) and x['variantId'] not in variants for x in designs.values()),
        'designLocalFileMissing':sum(not (path_under(data/'designs/files',x.get('file','')) or Path('/nonexistent')).is_file() for x in designs.values()),
        'configurationMissingDesign':sum(x.get('designId') not in designs for x in configs),
        'configurationMissingVariant':sum(x.get('variantId') not in variants for x in configs),
        'configurationMissingProduct':sum(x.get('productId') not in products for x in configs),
        'configurationProductVariantMismatch':sum(x.get('variantId') in variants and variants[x['variantId']]['ProductId']!=x.get('productId') for x in configs),
        'configurationPatternUnavailableLocally':sum(x.get('designId') not in designs or digest(path_under(data/'designs/files',designs[x['designId']].get('file',''))) is None for x in configs),
        'configurationPatternHashDiffers':sum(x.get('designId') in designs and digest(path_under(data/'designs/files',designs[x['designId']].get('file',''))) is not None and digest(path_under(data/'designs/files',designs[x['designId']].get('file','')))!=x.get('sourceSha256') for x in configs),
        'configurationCurrentMaskUnavailableLocally':sum(x.get('variantId') not in variants or digest(source_path(variants[x['variantId']].get('SurfaceMask'))) is None for x in configs),
        'configurationCurrentSurfaceVersionDiffers':sum(x.get('variantId') in variants and digest(source_path(variants[x['variantId']].get('SurfaceMask'))) is not None and digest(source_path(variants[x['variantId']].get('SurfaceMask')))!=x.get('placement',{}).get('surfaceVersion') for x in configs),
        'orderMissingConfiguration':sum(bool(x.get('configurationId')) and not any(c.get('id')==x['configurationId'] and str(c.get('revision'))==x.get('configurationRevision') for c in configs) for x in snapshot['personalizedLines']),
        'draftMissingVariant':sum(x['variantId'] not in variants for x in drafts),
        'draftChangedSource':sum(x['variantId'] in variants and variants[x['variantId']].get('Image')!=x['image'] for x in drafts),
        'draftLocalFileMissing':sum(not (path_under(data/'product-surfaces/drafts',x['maskFile']) or Path('/nonexistent')).is_file() for x in drafts),
        'publishedMissingVariant':sum(x.get('variantReference') not in variants for x in published),
        'publishedSourceMismatch':sum(x.get('variantReference') in variants and variants[x['variantReference']].get('Image')!=x.get('sourceImage') for x in published)}
    file_counts={'expected':0,'verifiedLocal':0,'missingLocal':0,'hashMismatchLocal':0,'legacyNoFileManifest':0,'completeThreeFileManifest':0}
    for x in snapshot['personalizedLines']:
        files=x.get('files')
        if not files:file_counts['legacyNoFileManifest']+=1;continue
        if all(files.get(k) for k in ['pattern','productSource','composition']):file_counts['completeThreeFileManifest']+=1
        for key,suffix in [('pattern',''),('productSource','-source'),('composition','-preview')]:
            if not files.get(key):continue
            file_counts['expected']+=1
            path=path_under(data/'designs/files',f"order-{x['orderId'].replace('-','').lower()}-{x['position']}{suffix}")
            h=digest(path)
            field='missingLocal' if h is None else 'verifiedLocal' if h==files[key]['sha256'] and path.stat().st_size==files[key]['bytes'] else 'hashMismatchLocal'
            file_counts[field]+=1
    result['orderFileChecks']=file_counts
    result['draftDetails']=[{'productId':x['productId'],'variantId':x['variantId'],'sourceMatches':x['variantId'] in variants and variants[x['variantId']].get('Image')==x['image'],'filePresent':bool((path_under(data/'product-surfaces/drafts',x['maskFile']) or Path('/nonexistent')).is_file())} for x in drafts]
    bundles={'publishedAssetExpected':0,'publishedAssetVerified':0,'publishedAssetMissing':0,'publishedAssetHashMismatch':0,'fixtureFileExpected':0,'fixtureFileVerified':0,'fixtureFileMissingOrMismatch':0}
    for bundle in published:
        for role in ['source','mask','branding']:
            asset=bundle.get('inputs',{}).get(role)
            if not isinstance(asset,dict) or not asset.get('url'):continue
            bundles['publishedAssetExpected']+=1
            path=source_path(asset['url'].split('?',1)[0]);h=digest(path)
            key='publishedAssetMissing' if h is None else 'publishedAssetVerified' if h==asset.get('sha256') else 'publishedAssetHashMismatch'
            bundles[key]+=1
    for entry in manifest:
        for name,meta in entry.get('files',{}).items():
            bundles['fixtureFileExpected']+=1
            path=path_under(repo/'fixtures/product-surfaces/xinobi-u-accepted/variants',entry['slug']+'/'+(name if name=='current.json' else entry['version']+'/'+name))
            key='fixtureFileVerified' if digest(path)==meta.get('sha256') else 'fixtureFileMissingOrMismatch'
            bundles[key]+=1
    result['bundleChecks']=bundles
    return result

if __name__=='__main__':
    a=argparse.ArgumentParser();a.add_argument('--repo',type=Path,required=True);a.add_argument('--snapshot',type=Path,required=True);a.add_argument('--report',type=Path,required=True)
    args=a.parse_args()
    root=args.repo.resolve();output=args.report.resolve()
    forbidden=[root/'services/api/App_Data',root/'apps/web/public',root/'fixtures']
    if output==args.snapshot.resolve() or any(output.is_relative_to(p) for p in forbidden):
        a.error('Report must not overwrite input or application/fixture data.')
    report=run(root,json.loads(args.snapshot.read_text()))
    args.report.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'counts':report['counts'],'relations':report['relations'],'orderFileChecks':report['orderFileChecks']},ensure_ascii=False))
