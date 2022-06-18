import {hiragana, data} from './butadic.buta014.dic';

export function butadicTest(){
  return [3,14,159,2653].map((i) => {
    return data[i].map((ci) => hiragana[ci]).join('');
  }).join('/');
}

export { hiragana , data};
