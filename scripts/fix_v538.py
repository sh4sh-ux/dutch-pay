from pathlib import Path
import re

p = Path('index.html')
s = p.read_text(encoding='utf-8')
start = s.index('async function generateSettleCanvas(){')
m = re.search(r'\nasync function [A-Za-z0-9_]+\(', s[start + 1:])
if not m:
    raise SystemExit('next async function not found')
end = start + 1 + m.start()
f = s[start:end]

required = [
    'const shareTxns=normalTxns.concat(coupleTxnRows);',
    'const txnGroups=_groupTxnsByRecipient(shareTxns,_myName),DIV_H=3;',
    'const txnCardH=shareTxns.length?(shareTxns.length*TXN_ROW_H+txnGroups.length*DIV_H):EMPTY_CARD_H;',
    "y=drawSectionLabel('송금',y);",
    "y=drawSectionLabel('지출 내역',y);",
]
for needle in required:
    if needle not in f:
        raise SystemExit('missing expected marker: ' + needle)

f = f.replace('  const shareTxns=normalTxns.concat(coupleTxnRows);\n', '', 1)
old_metrics = (
    '  const txnGroups=_groupTxnsByRecipient(shareTxns,_myName),DIV_H=3;\n'
    '  const txnCardH=shareTxns.length?(shareTxns.length*TXN_ROW_H+txnGroups.length*DIV_H):EMPTY_CARD_H;\n'
    '  const itemCardH=validItems.length?validItems.length*ITEM_ROW_H:EMPTY_CARD_H;\n'
    '  const H=TOP_PAD+HEADER_H+SECTION_LABEL_H+TOTAL_CARD_H+SECTION_GAP+SECTION_LABEL_H+txnCardH+SECTION_GAP+SECTION_LABEL_H+itemCardH+(hasRounding?NOTICE_H:0)+BOTTOM_PAD;\n'
)
new_metrics = (
    '  const txnGroups=_groupTxnsByRecipient(normalTxns,_myName),DIV_H=3;\n'
    '  const txnCardH=normalTxns.length?(normalTxns.length*TXN_ROW_H+txnGroups.length*DIV_H):EMPTY_CARD_H;\n'
    '  const coupleCardH=coupleTxnRows.length?coupleTxnRows.length*TXN_ROW_H:0;\n'
    '  const coupleSection=coupleCardH?(SECTION_GAP+coupleCardH):0;\n'
    '  const itemCardH=validItems.length?validItems.length*ITEM_ROW_H:EMPTY_CARD_H;\n'
    '  const H=TOP_PAD+HEADER_H+SECTION_LABEL_H+TOTAL_CARD_H+SECTION_GAP+SECTION_LABEL_H+txnCardH+coupleSection+SECTION_GAP+SECTION_LABEL_H+itemCardH+(hasRounding?NOTICE_H:0)+BOTTOM_PAD;\n'
)
if old_metrics not in f:
    raise SystemExit('metrics block not found')
f = f.replace(old_metrics, new_metrics, 1)

tx_start = f.index("  y=drawSectionLabel('송금',y);")
tx_end = f.index("  y=drawSectionLabel('지출 내역',y);", tx_start)
replacement = '''  y=drawSectionLabel('송금',y);\n  drawCard(cardX,y,cardW,txnCardH);\n  if(!normalTxns.length){\n    drawEmpty('송금할 내역이 없어요',y,txnCardH);\n  }else{\n    let curY=y;\n    ctx.save();roundRectPath(ctx,cardX,y,cardW,txnCardH,28);ctx.clip();\n    txnGroups.forEach(group=>{\n      ctx.fillStyle=group.isOwner?C.blue:C.amber;ctx.fillRect(cardX,curY,cardW,DIV_H);curY+=DIV_H;\n      group.txns.forEach((t,ri)=>{\n        drawTxnRow(t,curY,TXN_ROW_H);\n        curY+=TXN_ROW_H;\n        if(ri<group.txns.length-1)drawDivider(curY);\n      });\n    });\n    ctx.restore();\n  }\n  y+=txnCardH;\n  if(coupleCardH){\n    y+=SECTION_GAP;\n    drawCard(cardX,y,cardW,coupleCardH);\n    coupleTxnRows.forEach((t,ri)=>{\n      drawTxnRow(t,y+ri*TXN_ROW_H,TXN_ROW_H);\n      if(ri<coupleTxnRows.length-1)drawDivider(y+(ri+1)*TXN_ROW_H);\n    });\n    y+=coupleCardH;\n  }\n  y+=SECTION_GAP;\n\n'''
f = f[:tx_start] + replacement + f[tx_end:]

if 'shareTxns' in f:
    raise SystemExit('shareTxns still present')
if 'drawCard(cardX,y,cardW,coupleCardH);' not in f:
    raise SystemExit('couple card render missing')

s = s[:start] + f + s[end:]
if "const APP_VERSION='v5.37';" not in s and "const APP_VERSION='v5.38';" not in s:
    raise SystemExit('APP_VERSION marker missing')
s = s.replace("const APP_VERSION='v5.37';", "const APP_VERSION='v5.38';", 1)
p.write_text(s, encoding='utf-8')

p = Path('sw.js')
sw = p.read_text(encoding='utf-8')
if 'dutch-pay-v5.37d' not in sw and 'dutch-pay-v5.38' not in sw:
    raise SystemExit('SW cache marker missing')
sw = sw.replace('dutch-pay-v5.37d', 'dutch-pay-v5.38', 1)
p.write_text(sw, encoding='utf-8')
