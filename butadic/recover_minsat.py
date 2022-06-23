from tes_rel import hiragana, cmap

s = open('tes.cnf.result','r').read().split('\n')
assert(s[0] == "SAT")
s = s[1].split(' ')
s = list(map(int,s))
assert(s[-1] == 0)
s = s[:-1]

for k,v in cmap.items():
	if k in s:
		assert(v[0] == "x")
		v1,v2 = v[1:].split('_')
		c = hiragana[int(v2)]
		print(v1,c)
	else:
		assert(-k in s)
	
