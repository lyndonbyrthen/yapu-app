
export type UnihanTriple = { cp: string; field: string; value: string; }; // raw line
export type UnihanFields = Record<string, string[]>; // field -> values[]
export type UnihanRow = {
  codepoint: string; // "U+6F22"
  char: string; // "漢"
  fields: UnihanFields;
};
export type UnihanMap = Map<string /* U+XXXX */, UnihanRow>;