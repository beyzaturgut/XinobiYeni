import {navigationItems} from '../src/admin-navigation.ts'

// Follow the screen's single navigation owner, including permission-filtered direct links.
export async function navigateTo(page,label){
  const item=navigationItems.find(item=>item.label===label)
  if(!item)throw new Error(`Unknown navigation destination: ${label}`)
  if(item.owner==='top'){
    const top=page.getByRole('navigation',{name:'Ana modüller'})
    const direct=top.locator(`[data-nav-view="${item.view}"]`)
    if(await direct.count()){await direct.click();return}
    const category=top.getByRole('button',{name:item.category,exact:true})
    await category.focus();await category.press('ArrowDown')
  }
  await page.locator(`[data-nav-view="${item.view}"]`).click()
}
