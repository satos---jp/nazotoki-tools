import {solve_query} from '../solver_str';

test('1 + 1 = 2', () => {
  expect(1 + 1).toBe(2);
});

test('さくらえび/くるまえび', () => {
  const log = () => {};
  const s = solve_query(['123えび','123よい'],log);
  console.log('さくらえび/くるまえび',s);
  expect(s.length).toBe(2);
  expect(s).toStrictEqual([
    [ [ 1, 'さ' ], [ 2, 'く' ], [ 3, 'ら' ] ],
    [ [ 1, 'く' ], [ 2, 'る' ], [ 3, 'ま' ] ]
  ]);
});

test('かたたたき', () => {
  const log = () => {};
  const s = solve_query(['か111き'],log);
  console.log('かたたたき',s);
  expect(s).toStrictEqual([
    [ [ 1, 'た' ] ]
  ]);
});
