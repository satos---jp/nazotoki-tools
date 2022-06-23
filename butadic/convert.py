# need to set PYTHONHASHSEED for reproducibility

import re

def get_butadic():
	data = open('butadic/buta014.dic','rb').read().decode('shift-jis')

	data = list(filter(lambda d: d != '',data.split('\r\n')))

	#print(data[0],data[-1],data[0].encode(),data[-1].encode())
	assert(data[0] == 'あー' and data[-1] == 'わんわん')
	
	hiragana = set()
	hexpr = '[あ-んー]'
	for d in data:
		g = re.match(r'^(%s)+$' % hexpr,d)
		if g is None:
			print('match failed',d)
			exit(-1)
		
		ds = re.findall(r'%s' % hexpr,d)
		hiragana = hiragana | set(ds)


	print(hiragana)
	hiragana = list(hiragana)
	def conv(d):
		ds = re.findall('%s' % hexpr,d)
		ds = list(map(lambda c: hiragana.index(c),ds))
		return ds

	data = list(map(conv,data))
	return (hiragana,data)
