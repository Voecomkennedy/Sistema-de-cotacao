# Sistema de cotação VoeComKennedy

Site estático publicado pelo GitHub Pages a partir de `main`.

## Duração com fusos

Na proposta, informe o aeroporto IATA, a **data local** e a hora da saída e da
chegada. A data de chegada é explícita: o sistema não adivinha o dia seguinte.
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
mudança de rota, duração manual, ida/volta, multitrecho e restauração de
histórico. Não executam a geração nem a impressão dos PDFs.

Prévia: `python3 -m http.server 8765` e abra http://localhost:8765.

## Proposta A4

O PDF de proposta usa `js/proposal-pdf.js` e `assets/proposal-a4.css`, com
páginas A4 de 210 × 297 mm, sem margens externas e rodapé no fim da página.
A prévia aguarda fontes e logos antes de habilitar **Salvar / imprimir PDF**.
No diálogo de impressão, use A4, escala 100%, sem margens e desative o
cabeçalho/rodapé do navegador. Conteúdo extenso continua em outra página A4.

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

Os testes do renderizador verificam datas, operadora, preços, comparativos,
logos e escape de dados. A paginação exige conferência visual em navegador;
os testes de unidade não acionam a impressão.
