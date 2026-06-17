import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const SOUND_BASE64 = [
  'SUQzBAAAAAAAf1RYWFgAAAASAAADbWFqb3JfYnJhbmQAbXA0MgBUWFhYAAAAEQAAA21pbm9yX3ZlcnNpb24AMABUWFhYAAAA',
  'HAAAA2NvbXBhdGlibGVfYnJhbmRzAG1wNDJpc29tAFRTU0UAAAAOAAADTGF2ZjYxLjcuMTAwAAAAAAAAAAAAAAD/81jAAAAA',
  'AAAAAAAASW5mbwAAAA8AAABIAAAU9AAMDxISFhkdHSAkJCcqLi4xNTU4PD8/Q0ZJSU1QUFRXW1teYWFlaGxsb3Nzdnl9fYCE',
  'h4eLjo6SlZiYnJ+fo6aqqq2wsLS3u7u+wsXFyczMz9PW1trd3eHk5+fr7u7u7y9fn5/P8AAAAATGF2YzYxLjE5AAAAAAAAAAAA',
  'AAAAJAOQAAAAAAAAFPTsupOoAAAAAAAAAAAAAAD/8yjEAAAAA0gAAAAA8i+4J5/6n/4sBD//Qgor//seqE//yZFOKf//iYuy',
  'CgIeT///8kCEICNeB//+fQgHz6SCqORyGJyGQyX/8yjEOwAAA0gBQAAAmcRiMEAGIdDlIUUVMhFsudPnozmK5UBcdtLmTCQf',
  '1ZXZ1SzmLMHjZ/oZ1RejSh65sxluyHiEnqPy2eT/8yjEdgyqWoQBhSgARm3kfO/VScstpmxav/b/qTsfzH////NrL9J6wBIC',
  'UHbtIOkHO0UkSZSKWiRn3o80gB0ogmRWjCw1HVf/8yjEfhdjDvJfhlABZZ9L5GgCL3wte6cX+NtV6uI64/5iNdbtPj28bMfz',
  'X9//6trP7pt/wWRTcT78e2kwqxSNU8L/u31atf//8yjEWxhDGuGTxkABczFTdjJWwDiUEuVF8mDlV1mrs2a0P5NDh3fsYZIV',
  'aZaVtm1ape7c6VF3X/4J9u+hSSi7w/oTJ+VeSxv/8yjENRYKitVyWMVkuRUuVvfowAZf9ZedHVH0lZVbw9mb7bLwexJ4wo0F',
  'luu6JAhVkBgBtvVKmOUSdaGmeg0aBwYueR9rpS3/8yjEFxJTGtmQWgskyayK8WYrfHK5T/8woEFicpWQyP6GAFpc0jou9rL4',
  '7/Mw+6f6/V1//6///X9/8v//8RpVgIoPEmU6Vl//8yjECA77GtxSAs4QDai1oFwl1TYkfY0sjzBENV10coLvTDSdfb7HjKft',
  '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',
  'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqo=',
].join('');

const targets = [
  resolve(projectRoot, 'assets/sounds/jota-notification.mp3'),
  resolve(projectRoot, 'public/sounds/jota-notification.mp3'),
];

for (const target of targets) {
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, Buffer.from(SOUND_BASE64, 'base64'));
}

console.log('[notifications] Sound asset written to assets/sounds and public/sounds.');
