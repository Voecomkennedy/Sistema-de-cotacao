/* A4 proposal as a real, searchable PDF. pdfmake is bundled locally for offline use. */
(function (root) {
  'use strict';
  const navy = '#0A1931', blue = '#1A3D63', sky = '#4A7FA7', pale = '#F6FAFD', muted = '#526477';
  const brl = n => Number(n).toLocaleString('pt-BR', {style:'currency',currency:'BRL'});
  const moneyInput = value => {
    if (!value) return '';
    const raw=String(value).replace(/R\$|\s/g,'');
    const amount=Number(raw.includes(',') ? raw.replace(/\./g,'').replace(',','.') : raw);
    return Number.isFinite(amount) ? brl(amount) : String(value);
  };
  const code = text => String(text || '').split(/\s*[—–]\s*/)[0];
  const city = text => String(text || '').split(/\s*[—–]\s*/)[1] || code(text);
  const date = iso => /^\d{4}-\d{2}-\d{2}$/.test(iso || '') ?
    new Intl.DateTimeFormat('pt-BR', {day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(iso+'T12:00:00Z')) : '';
  const url = text => { try { const u = new URL(text); return /^https?:$/.test(u.protocol) ? u.href : ''; } catch { return ''; } };
  const section = (title, sub) => ({columns:[{text:title.toUpperCase(),bold:true,fontSize:9,color:blue,characterSpacing:1.5},{text:sub || '',alignment:'right',fontSize:8,color:muted}],margin:[0,16,0,8]});
  const text = (value, extra={}) => ({text:String(value || ''),...extra});
  function connections(d, key) {
    const count = Number(String(d['parada'+key] || '').match(/\d/)?.[0] || 0);
    return Array.from({length:count}, (_,i) => {
      const n=i+1, suffix=i?String(n):'';
      const place=d['escalaCidade'+suffix+key] || 'a confirmar';
      const next=d['troca'+key+n] ? ' → '+(d['troca'+key+n+'Dest'] || 'a confirmar') : '';
      return (next?'Troca de aeroporto: ':'Conexão em ')+place+next+(d['escalaTempo'+suffix+key]?' · espera '+d['escalaTempo'+suffix+key]:'');
    });
  }
  function leg(d, key, from, to, logo) {
    const dep=d['data'+key+'ISO'], arr=d.timing?.fields?.['p-data-chegada-'+key.toLowerCase()];
    const stops=connections(d,key);
    const baggage=d['bagDesp'+key] ? 'Bagagem despachada: '+d['bagDesp'+key] : '';
    const flightNumbers=[1,2,3,4].slice(0,stops.length+1).map(n=>d['voo'+key+(n===1?'':n)]).filter(Boolean);
    const cia=key==='Volta' ? d.ciaVolta || d.cia : d.cia;
    const operator=d['ciaOperadora'+key];
    const details=[cia,operator && operator!==cia ? 'Operado por '+operator : '',d.classe,
      flightNumbers.join(' · '),d.bagMao?'Bagagem de mão: '+d.bagMao:'',baggage].filter(Boolean).join('\n');
    const arrivalNote=arr && arr!==dep ? 'Chegada '+date(arr) : '';
    return {table:{widths:[67,'*',143],body:[[
      {stack:[text(key.toUpperCase(),{fontSize:8,bold:true,color:sky}),text(date(dep),{fontSize:11,bold:true,margin:[0,7,0,0]})],fillColor:pale},
      {stack:[{columns:[text(d['dep'+key] || '—',{bold:true,fontSize:17}),text(d['dur'+key] || '',{alignment:'center',fontSize:8,color:blue}),text(d['cheg'+key] || '—',{alignment:'right',bold:true,fontSize:17})]},
        {columns:[text(code(from),{bold:true,color:blue}),text(stops.length?stops.join('\n'):'Voo direto',{alignment:'center',fontSize:7,color:muted}),text(code(to),{alignment:'right',bold:true,color:blue})],margin:[0,6,0,0]},
        text(arrivalNote,{fontSize:7,color:sky,alignment:'right',margin:[0,6,0,0]})]},
      {stack:[...(logo?[{[logo.trimStart().startsWith('<svg')?'svg':'image']:logo,fit:[78,25],margin:[0,0,0,5]}]:[]),text(details,{fontSize:8,lineHeight:1.3})],color:navy}
    ]]},layout:{fillColor:()=>null,hLineColor:()=> '#D7E4EE',vLineColor:()=> '#D7E4EE',paddingLeft:()=>9,paddingRight:()=>9,paddingTop:()=>11,paddingBottom:()=>11},margin:[0,0,0,9]};
  }
  function valueCard(label,amount,sub) {
    return {stack:[text(label.toUpperCase(),{fontSize:8,bold:true,color:sky}),text(amount,{fontSize:16,bold:true,color:navy,margin:[0,8,0,2]}),text(sub,{fontSize:8,color:muted})],fillColor:pale,margin:[0,0,0,0]};
  }
  function definition(d, config={}) {
    const pax=Number(d.totalPax)||1;
    const content=[
      {table:{widths:['*'],body:[[{stack:[
        text(d.somenteIda?'SOMENTE IDA':d.multitrecho?'MÚLTIPLOS DESTINOS':'IDA E VOLTA',{fontSize:8,color:'#B3CFE5',characterSpacing:2}),
        text(city(d.orig)+'  >  '+city(d.dest),{fontSize:23,bold:true,color:'#FFFFFF',margin:[0,9,0,4]}),
        text(code(d.orig)+' · '+code(d.dest)+'     |     '+pax+' passageiro'+(pax>1?'s':'')+'     |     '+(d.cia||''),{fontSize:9,color:'#DCEAF4'}),
        text('Preparada para: '+(d.cliente||'Cotação de teste'),{fontSize:10,color:'#FFFFFF',margin:[0,12,0,0]})
      ],fillColor:navy}]]},layout:{hLineWidth:()=>0,vLineWidth:()=>0,paddingLeft:()=>16,paddingRight:()=>16,paddingTop:()=>18,paddingBottom:()=>18}},
      section('Itinerário','horários locais de cada aeroporto'),
      leg(d,'Ida',d.orig,d.dest,config.logos?.Ida)
    ];
    if(!d.somenteIda) content.push(leg(d,'Volta',d.multitrecho&&d.origVolta?d.origVolta:d.dest,d.multitrecho&&d.destVolta?d.destVolta:d.orig,config.logos?.Volta));
    if(d.hotelNome) content.push(section('Hospedagem'),text(d.hotelNome,{bold:true,fontSize:11}),
      text([d.hotelCheckin&&'Check-in: '+d.hotelCheckin,d.hotelCheckout&&'Check-out: '+d.hotelCheckout,d.hotelRegime].filter(Boolean).join(' · '),{fontSize:9,margin:[0,5,0,0]}),
      ...(url(d.linkHotel)?[{text:'Ver fotos e detalhes do hotel',link:url(d.linkHotel),color:sky,decoration:'underline',margin:[0,4,0,0]}]:[]));
    content.push(section('Investimento','valores em reais'));
    const choices=root.ProposalPDF?.options ? root.ProposalPDF.options(d) : [];
    if(choices.length) {
      for(const choice of choices) {
        const card=root.ProposalPDF.cardForOption(d,choice,{cardDivisor:config.cardDivisor});
        content.push({table:{widths:['*'],body:[[{stack:[
          text(choice.label+(choice.selected?' · selecionada':''),{bold:true,fontSize:11,color:navy}),
          text(choice.detail,{fontSize:8,color:muted}),
          text(brl(choice.pp)+' por pessoa no Pix',{fontSize:14,bold:true,margin:[0,7,0,2]}),
          text('Total no Pix: '+brl(choice.total)+(card?'   |   Cartão: '+card.label+' ('+card.sub+')':''),{fontSize:9})
        ],fillColor:pale}]]},layout:'noBorders',margin:[0,0,0,7]});
      }
    } else {
      const card=d.valCartaoBase ? (Number(d.parcelas)>1 && d.valParcela ?
        d.parcelas+'x de '+moneyInput(d.valParcela)+' · total '+moneyInput(d.valCartaoFinal||d.valCartaoBase) :
        moneyInput(d.valCartaoFinal||d.valCartaoBase)) : '';
      content.push({table:{widths:['*','*','*'],body:[[
        valueCard('Por pessoa no Pix',moneyInput(d.valPix) || '—',pax+' passageiro'+(pax>1?'s':'')),
        valueCard('Total no Pix',moneyInput(d.valTotalPix) || '—','Todos os passageiros'),
        valueCard('Cartão de crédito',card || '—','Todos os passageiros')
      ]]},layout:{hLineColor:()=> '#B3CFE5',vLineColor:()=> '#B3CFE5',paddingLeft:()=>12,paddingRight:()=>12,paddingTop:()=>12,paddingBottom:()=>12}});
    }
    content.push(section('Próximos passos'),{ol:[
      'Confirme a opção escolhida e a forma de pagamento pelo WhatsApp.',
      'Confira e envie os dados dos passageiros como constam no documento de viagem.',
      'Após a confirmação, enviamos os bilhetes e localizadores.'
    ],fontSize:9,color:navy});
    if(d.obs) content.push(section('Observações'),...String(d.obs).split(/\n+/).filter(Boolean).map(line=>text(line,{fontSize:9,margin:[0,2,0,3]})));
    if(url(d.linkAereo))content.push({text:'Ver detalhes dos voos',link:url(d.linkAereo),color:sky,decoration:'underline',margin:[0,8,0,0]});
    content.push(text('Valores e disponibilidade sujeitos a alteração até a emissão. Confira os documentos e requisitos de entrada e trânsito aplicáveis ao itinerário.',{fontSize:8,color:muted,margin:[0,15,0,0]}));
    return {pageSize:'A4',pageMargins:[40,69,40,54],info:{title:'Proposta · '+(d.cliente||'Cotação de teste'),author:'VoeComKennedy'},
      header:{columns:[text('VOECOMKENNEDY',{bold:true,fontSize:12,characterSpacing:2,color:navy}),text('PROPOSTA COMERCIAL',{alignment:'right',fontSize:8,color:sky})],margin:[40,26,40,0]},
      footer:(page,pages)=>({columns:[{text:'VOECOMKENNEDY · CNPJ 56.913.032/0001-32',width:'*',fontSize:7,color:muted},{text:'WhatsApp (62) 99644-8671 · '+page+' / '+pages,width:185,alignment:'right',fontSize:7,color:muted}],columnGap:20,margin:[40,14,40,0]}),
      content,defaultStyle:{font:'Roboto',color:navy},styles:{}};
  }
  async function imageData(relative) {
    if(!relative || typeof fetch!=='function')return '';
    const response=await fetch(new URL('assets/airlines/'+relative,location.href));
    if(!response.ok)throw new Error('Logo indisponível');
    if(relative.toLowerCase().endsWith('.svg')) {
      const svg=await response.text();
      const start=svg.indexOf('<svg');
      if(start<0)throw new Error('Logo SVG inválido');
      return svg.slice(start);
    }
    const blob=await response.blob();
    return await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});
  }
  async function download(d,config={}) {
    if(!root.pdfMake)throw new Error('O gerador de PDF não carregou. Atualize a página.');
    const logos={};
    for(const key of ['Ida','Volta']) {
      const name=key==='Ida'?d.cia:d.ciaVolta||d.cia;
      try { logos[key]=await imageData(root.ProposalPDF?.getLogo(name)); } catch { /* Keep carrier text if an asset is unavailable. */ }
    }
    const doc=definition(d,{...config,logos});
    const blob=await new Promise((resolve,reject)=>{
      try {root.pdfMake.createPdf(doc).getBlob(resolve);}catch(error){reject(error);}
    });
    if(blob.type!=='application/pdf' || !/^%PDF/.test(await blob.slice(0,8).text()))throw new Error('O arquivo gerado não é um PDF válido.');
    const objectUrl=URL.createObjectURL(blob);
    const anchor=document.createElement('a');
    anchor.href=objectUrl;anchor.download='Proposta_VoeComKennedy_'+String(d.cliente||'Cotacao').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_')+'.pdf';
    document.body.append(anchor);anchor.click();anchor.remove();
    setTimeout(()=>URL.revokeObjectURL(objectUrl),60000);
    return blob;
  }
  const api={definition,download};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.ProposalDownload=api;
})(typeof globalThis!=='undefined'?globalThis:this);
