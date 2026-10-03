# Sistema de cotação VoeComKennedy

Site estático publicado pelo GitHub Pages a partir de `main`.

## Duração com fusos

Na proposta, informe o aeroporto IATA, a **data local** e a hora da saída e da
chegada. Uma proposta nova começa no dia local do aparelho. As datas conhecidas
seguem para a volta e as conexões; quando os horários extremos e os fusos
permitem inferir uma chegada curta, a data pode avançar para o dia seguinte
ou retroceder na linha internacional de data. Confira o bilhete. Datas alteradas
manualmente ou restauradas não são substituídas por esses preenchimentos.
O total é o tempo decorrido real e já inclui as conexões.

Para cada escala, abra **Calcular espera pelos horários da conexão** e informe
as datas e horas locais da chegada e da próxima saída. Se houver troca de
aeroporto, informe também o segundo aeroporto. Sem horários de conexão, a
espera fica vazia; pode ser preenchida marcando a opção manual e digitando a
duração conferida no bilhete. Formatos aceitos: `16h 53m`, `2h`, `55 min`.

No voucher, os horários de cada trecho alimentam a duração e a espera.
Os horários do voucher são opcionais para documentos somente de hospedagem.

Alterar rota ou horários invalida uma duração manual anterior. A geração é
bloqueada quando um voo ativo não tem duração válida ou uma conexão tem dados
parciais/inconsistentes. Uma conexão sem horários pode omitir a espera.

Datas e modo manual são preservados no histórico e no backup. Propostas
antigas precisam ter as datas de chegada conferidas; durações antigas não
são automaticamente consideradas corretas. As datas locais de chegada são
incluídas no modelo de proposta para distinguir chegadas em outro dia.

Base de aeroportos e licença: [data/README.md](data/README.md).

## Verificação

Node 22+ (versão suportada pela dependência de teste) e npm:

```sh
npm ci
npm test
TZ=Asia/Tokyo npm test
```

Os testes verificam fusos, DST, linha internacional de data, escalas,
mudança de rota, duração manual, ida/volta, multitrecho, restauração de
histórico e geração de bytes PDF.

Prévia: `python3 -m http.server 8765` e abra http://localhost:8765.

## Proposta A4

O botão **Gerar Proposta / PDF** baixa diretamente um arquivo
`application/pdf`, sem abrir janela de impressão. `js/proposal-download.js`
usa pdfmake local (`assets/vendor/`) para páginas A4 de 210 × 297 mm,
texto selecionável, logos e links clicáveis. Conteúdo extenso continua
em outras páginas. O modelo HTML anterior permanece em `js/proposal-pdf.js`
para compatibilidade e como referência visual.

- Chegadas exibem a data local e `+1`, `+2` ou `-1`, conforme o calendário.
- “Operado por” aparece apenas quando a operadora difere da companhia.
- Comparativos substituem o bloco de pagamento comum; não duplicam valores.
- Parcelas de cada opção seguem a tabela de juros já usada no formulário.
  Um valor de cartão negociado manualmente não é extrapolado às demais opções.
- Logos conhecidas e fontes ficam hospedadas neste repositório. Companhia
  desconhecida continua identificada pelo nome. Créditos em `assets/airlines/`
  e licenças das fontes em `assets/fonts/`.
- Hospedagem, observações, conexões, trocas de aeroporto e links informados
  são preservados. O voucher mantém seu próprio modelo.

Para gerar o PDF de conferência, execute `node tests/generate-test-pdf.cjs`.
Ele salva a cotação solicitada em `output/pdf/`, ignorada pelo Git.
