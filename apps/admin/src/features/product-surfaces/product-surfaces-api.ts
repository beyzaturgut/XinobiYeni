// Temporary feature-local contract; generated clients remain untouched.
export const reviewRoot = '/api/v1/admin/dev/product-surfaces/tea-maker-101-blue'
export type Point = { x: number; y: number; intent: 'keep' | 'exclude' }
export type MaskStroke = { operation: 'add' | 'remove'; radius: number; points: { x: number; y: number }[] }
export type ReviewState = {
  sessionId: string; stateVersion: number; source: { width: number; height: number; sha256: string; mediaVersionId: string }
  productReference: string; variantReference: string; assetReference: string; sourceUrl: string; revisionCount: number
  provider?: string; providerLabel?: string; operationInProgress?: boolean; lastError?: string | null
  refinementAvailable?: boolean
  correction?: null | { parentRevisionId: string; parentCandidateId: string; parentMaskSha256: string;
    outputMaskSha256: string; algorithm: string; algorithmVersion: string;
    operations: { operation: 0 | 1; radius: number; points: { x: number; y: number }[] }[] }
  rawCandidate?: ReviewState['candidate']
  derivation?: null | { rawRevisionId: string; rawCandidateId: string; rawMaskSha256: string; derivedMaskSha256: string;
    algorithm: string; algorithmVersion: string; connectivity: number; maxEnclosedHoleAreaPixels: number;
    holesFound: number; holesFilled: number; pixelsFilled: number; derivedRevisionId: string; derivedCandidateId: string }
  candidate: null | { revisionId: string; candidateId: string; mode: string; status: 'pending' | 'approved' | 'rejected'; previousCandidateId: string | null; points: Point[]; maskUrl: string }
  activeApproval: { candidateId: string; revisionId: string; reviewer: string } | null
}
export class ReviewError extends Error {
  status: number; requestId?: string
  constructor(status: number, requestId?: string) { super(status === 409 ? 'İnceleme değişti. Güncel aday yeniden yüklendi; kararınızı tekrar inceleyin.' : 'İnceleme işlemi tamamlanamadı. Lütfen yeniden deneyin.'); this.status = status; this.requestId = requestId }
}
export async function reviewRequest(path: string, body?: unknown): Promise<ReviewState> {
  const response = await fetch(reviewRoot + path, { method: body ? 'POST' : 'GET', headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined })
  if (!response.ok) {
    const problem = await response.json().catch(() => ({})) as { requestId?: string }
    throw new ReviewError(response.status, problem.requestId)
  }
  return response.json() as Promise<ReviewState>
}
