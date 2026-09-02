export const sources=Object.freeze([
  {key:'aet',name:'Gestao de AETs',url:'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_Ry7aRW5A3zpaLdCu2u_xb3vgfOjnfHRmSH_OyvVX3wzmxvh4fSZBFvZakDRF2eDNA3DWJk9OFbml/pub?output=csv&gid=1076498373'},
  {key:'mob',name:'Mobilizacoes',url:'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_Ry7aRW5A3zpaLdCu2u_xb3vgfOjnfHRmSH_OyvVX3wzmxvh4fSZBFvZakDRF2eDNA3DWJk9OFbml/pub?output=csv&gid=1729222115'},
  {key:'mat-tie',name:'Materiais TIE',url:'https://docs.google.com/spreadsheets/d/e/2PACX-1vR1E33A1HGe5Qs178YvjZnrV_eA-RDIjVkxczBTHBwhk2w0_9LzGuhxLxzrIWu9jHEhKr6oZ66hoJYr/pub?gid=1385059435&single=true&output=csv'},
  {key:'mat-safety',name:'Materiais Safety',url:'https://docs.google.com/spreadsheets/d/e/2PACX-1vR1E33A1HGe5Qs178YvjZnrV_eA-RDIjVkxczBTHBwhk2w0_9LzGuhxLxzrIWu9jHEhKr6oZ66hoJYr/pub?gid=1640125903&single=true&output=csv'},
  {key:'patio',name:'Gestao de Patio',url:'https://docs.google.com/spreadsheets/d/e/2PACX-1vRuyDBTaz3bDMc7uelyXQ8t5GkpUjdr0pfK2xm9TZHHJL6uEVEo0GxrTImAyKs-PbjHhhmNIziyBXMO/pub?output=csv'},
  {key:'patio-inventory',name:'Inventario de Patio',url:'https://docs.google.com/spreadsheets/d/e/2PACX-1vSomS3X_Fcay2QsVwB-ebdBwkuUpOFE6zPv599IoFEGwdQVOW_aloK2r4Rf1bcpa0j1ab6XIRbQ3HJM/pub?output=csv'},
  {key:'inef',name:'Ineficiencias Operacionais',url:'https://docs.google.com/spreadsheets/d/e/2PACX-1vQa_KB7NVqy6w4B2QRGFcNnvQEv3G_F2YjEprDxd9hZE2TDplS5RR_ZKmmoSypw5lwj2PKaAtOM4URz/pub?output=csv&gid=262129708'},
  {key:'rpd',name:'RPD',url:'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_rfQGQXLNr0XsYzPab32cj30MbIJ2VLisoCZqio-qc_XP1p2J532LuNOEFNhu9fg52UW_zRTfQyN3/pub?gid=1614487064&single=true&output=csv'},
  {key:'budget',name:'Orcamento 2026',url:'https://docs.google.com/spreadsheets/d/e/2PACX-1vR2nrorePlX5AmlSY3iPHpXyFbv4sYG3KeGEFyJbZOO-e2H7E9iSTnqaJZcnLl7fi7QMB_-M4L64yk4/pub?output=csv&gid=903790692'},
  {key:'result-bi',name:'Resultado contabil BI',url:'https://docs.google.com/spreadsheets/d/e/2PACX-1vRJCb4qUO4Rv6umak_zGHWGExLaOPQpZWNjPi2frLNbwOTJyzh6y06XOGMH_TugjU6iqF46ypDlSOCt/pub?output=csv'},
  {key:'fleet-billing',name:'ROB por Frota',url:'https://docs.google.com/spreadsheets/d/e/2PACX-1vQa_KB7NVqy6w4B2QRGFcNnvQEv3G_F2YjEprDxd9hZE2TDplS5RR_ZKmmoSypw5lwj2PKaAtOM4URz/pub?output=csv&gid=1256794079'},
  {key:'freight-rates',name:'Tabela de Frete',url:'https://docs.google.com/spreadsheets/d/e/2PACX-1vQa_KB7NVqy6w4B2QRGFcNnvQEv3G_F2YjEprDxd9hZE2TDplS5RR_ZKmmoSypw5lwj2PKaAtOM4URz/pub?output=csv&gid=1374757392'},
  {key:'makro-assets',name:'Base de Ativos Makro',url:'https://docs.google.com/spreadsheets/d/e/2PACX-1vRuXBqTTc4oX0_e_gGnueuum1tKmqLeGb_ftuE0aVrRGIebBwK0U1d-MeLmJkH3SflQxQqDcOaH4ZEP/pub?output=csv&gid=519353169'},
  ...[
    ['efl-mar','Eficiencia Logistica - Marco','597669245'],
    ['efl-apr','Eficiencia Logistica - Abril','1761032016'],
    ['efl-may','Eficiencia Logistica - Maio','272661921'],
    ['efl-jul','Eficiencia Logistica - Julho','655500116'],
    ['efl-aug','Eficiencia Logistica - Agosto','332845704']
  ].map(([key,name,gid])=>({key,name,url:`https://docs.google.com/spreadsheets/d/e/2PACX-1vQgksY-EN253ap3PxlGvh5J3NACPfbeOkeoNipkIOpo1mV06Q3Wgqu8rTM2k-vFaXZrF166yu62JEWS/pub?output=csv&gid=${gid}`})),
  ...[
    ['prog-w28','Programacao Semanal W28','97434237'],
    ['prog-w29','Programacao Semanal W29','5333880'],
    ['prog-w30','Programacao Semanal W30','1440172390'],
    ['prog-w31','Programacao Semanal W31','1036195827'],
    ['prog-w32','Programacao Semanal W32','1272760441'],
    ['prog-w33','Programacao Semanal W33','1746627562'],
    ['prog-w34','Programacao Semanal W34','88423907'],
    ['prog-w35','Programacao Semanal W35','1396448823'],
    ['prog-w36','Programacao Semanal W36','509098163']
  ].map(([key,name,gid])=>({key,name,url:`https://docs.google.com/spreadsheets/d/e/2PACX-1vTQWdxW-Qn5RKMC-Gb6Naq6pRsrx1UfWobug_0-y8cU6e0surPMON-_HIdzK5aade_G41YekLbvPMt2/pub?output=csv&gid=${gid}`}))
]);

export function findSource(key){
  return sources.find(source=>source.key===key);
}

