

# gen_cnfのテストをする場合
```
time npx ts-node -O "{\"module\":\"commonjs\"}" gen_cnf.ts 
~/toys/minisat/build/release/bin/minisat tes.cnf tes.cnf.result
python3 recover_minsat.py 
```

# minsat/test2のtestをする場合 
```
~/toys/minisat/build/release/bin/minisat tes.cnf tes.cnf.result
python3 recover_minsat.py
```
