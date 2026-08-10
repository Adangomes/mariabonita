// impressoras/printStyles.js
export const CSS_IMPRESSAO = `
  #area-impressao {
    display: none;
  }

  @media print {
    body * {
      visibility: hidden;
    }
    
    #area-impressao, #area-impressao * {
      visibility: visible;
      display: block !important;
    }
    
    #area-impressao {
      position: absolute;
      left: 0;
      top: 0;
      width: 58mm;
      font-family: 'Courier New', Courier, monospace;
      font-size: 10px;
      color: #000;
      background: #fff;
      padding: 2mm;
      box-sizing: border-box;
    }
  }

  .cupom-container {
    width: 100%;
    max-width: 54mm;
    font-family: 'Courier New', Courier, monospace;
    font-size: 10px;
    line-height: 1.2;
    word-break: break-word;
  }
  .cupom-header {
    text-align: center;
    border-bottom: 1px dashed #000;
    padding-bottom: 4px;
    margin-bottom: 4px;
  }
  .cupom-header h2 {
    margin: 0;
    font-size: 14px;
    text-transform: uppercase;
  }
  .cupom-destaque-cliente {
    border: 1.5px solid #000;
    padding: 4px;
    text-align: center;
    margin: 6px 0;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
  }
  .cupom-info {
    margin-bottom: 4px;
    border-bottom: 1px dashed #000;
    padding-bottom: 4px;
    font-size: 9.5px;
  }
  .cupom-tabela {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 4px;
    font-size: 9.5px;
  }
  .cupom-tabela th {
    border-bottom: 1px solid #000;
    text-align: left;
    font-size: 9px;
  }
  .cupom-tabela td {
    padding: 2px 0;
    vertical-align: top;
  }
  .cupom-totais {
    border-top: 1px dashed #000;
    padding-top: 4px;
    margin-top: 4px;
    font-size: 10px;
  }
  .linha-flex {
    display: flex;
    justify-content: space-between;
  }
  .cupom-footer {
    text-align: center;
    margin-top: 8px;
    border-top: 1px dashed #000;
    padding-top: 4px;
    font-size: 9px;
  }
`;
