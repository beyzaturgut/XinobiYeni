export const reportPeriods=['Bugün','Dün','Bu Hafta','Geçen Hafta','Bu Ay','Geçen Ay','Bu Yıl','Geçen Yıl','Tüm Zamanlar'] as const
export type ReportPeriod=typeof reportPeriods[number]
export function reportRange(period:ReportPeriod,today:string){
  const date=new Date(today+'T00:00:00Z'),start=new Date(date),end=new Date(date)
  const day=(value:Date)=>value.toISOString().slice(0,10)
  switch(period){
    case 'Bugün':end.setUTCDate(end.getUTCDate()+1);break
    case 'Dün':start.setUTCDate(start.getUTCDate()-1);break
    case 'Bu Hafta':start.setUTCDate(start.getUTCDate()-(start.getUTCDay()+6)%7);end.setTime(start.getTime());end.setUTCDate(start.getUTCDate()+7);break
    case 'Geçen Hafta':end.setUTCDate(end.getUTCDate()-(end.getUTCDay()+6)%7);start.setTime(end.getTime());start.setUTCDate(start.getUTCDate()-7);break
    case 'Bu Ay':start.setUTCDate(1);end.setUTCMonth(start.getUTCMonth()+1,1);break
    case 'Geçen Ay':end.setUTCDate(1);start.setUTCMonth(start.getUTCMonth()-1,1);break
    case 'Bu Yıl':start.setUTCMonth(0,1);end.setUTCFullYear(start.getUTCFullYear()+1,0,1);break
    case 'Geçen Yıl':end.setUTCMonth(0,1);start.setUTCFullYear(start.getUTCFullYear()-1,0,1);break
    case 'Tüm Zamanlar':return {query:'',label:'Başlangıçtan isteğin alındığı ana kadar (UTC)'}
  }
  const from=day(start),until=day(end)
  return {query:'?'+new URLSearchParams({from,until}),label:`${from} dahil — ${until} hariç (UTC)`}
}
