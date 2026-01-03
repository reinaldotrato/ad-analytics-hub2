/**
 * Corrige problemas de encoding comuns quando strings são armazenadas
 * com encoding ISO-8859-1 mas exibidas como UTF-8.
 */
export function fixEncoding(str: string | null | undefined): string {
  if (!str) return '';
  
  // Mapeamento de caracteres com encoding incorreto para caracteres corretos
  const replacements: [string, string][] = [
    // Caractere específico encontrado no sistema
    ['\u2B29', 'Ç'],
    
    // Maiúsculas acentuadas - double encoding UTF-8
    ['Ã‡', 'Ç'],
    ['Ã€', 'À'],
    ['Ã\u0081', 'Á'],
    ['Ã‚', 'Â'],
    ['Ãƒ', 'Ã'],
    ['Ã„', 'Ä'],
    ['Ã‰', 'É'],
    ['ÃŠ', 'Ê'],
    ['Ã‹', 'Ë'],
    ['ÃŒ', 'Ì'],
    ['Ã\u008D', 'Í'],
    ['ÃŽ', 'Î'],
    ['Ã"', 'Ó'],
    ['Ã"', 'Ô'],
    ['Ã•', 'Õ'],
    ['Ã–', 'Ö'],
    ['Ã™', 'Ù'],
    ['Ãš', 'Ú'],
    ['Ã›', 'Û'],
    ['Ãœ', 'Ü'],
    
    // Minúsculas acentuadas
    ['Ã§', 'ç'],
    ['Ã¡', 'á'],
    ['Ã\u00A0', 'à'],
    ['Ã¢', 'â'],
    ['Ã£', 'ã'],
    ['Ã¤', 'ä'],
    ['Ã©', 'é'],
    ['Ã¨', 'è'],
    ['Ãª', 'ê'],
    ['Ã«', 'ë'],
    ['Ã\u00AD', 'í'],
    ['Ã¬', 'ì'],
    ['Ã®', 'î'],
    ['Ã¯', 'ï'],
    ['Ã³', 'ó'],
    ['Ã²', 'ò'],
    ['Ã´', 'ô'],
    ['Ãµ', 'õ'],
    ['Ã¶', 'ö'],
    ['Ãº', 'ú'],
    ['Ã¹', 'ù'],
    ['Ã»', 'û'],
    ['Ã¼', 'ü'],
    ['Ã±', 'ñ'],
    
    // Outros caracteres especiais comuns
    ['â€"', '–'],
    ['â€"', '—'],
    ['â€œ', '"'],
    ['â€\u009D', '"'],
    ['â€˜', "'"],
    ['â€™', "'"],
    ['â€¦', '…'],
    ['Â°', '°'],
    ['Âº', 'º'],
    ['Âª', 'ª'],
  ];
  
  let result = str;
  for (const [wrong, correct] of replacements) {
    result = result.split(wrong).join(correct);
  }
  
  return result;
}
