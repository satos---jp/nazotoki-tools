import convert

hiragana,data = convert.get_butadic()
template = """
export const hiragana : string[] = %s;
export const data : number[][] = %s;
""" % (repr(hiragana),repr(data))

open('../src/butadic.buta014.dic.ts','w').write(template)
