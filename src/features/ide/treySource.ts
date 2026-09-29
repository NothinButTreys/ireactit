import { MOODS, type TreyProps } from './treyProps';

export type TokenKind = 'kw' | 'tag' | 'prop' | 'str' | 'num' | 'punct' | 'plain';
export type Token = { text: string; kind: TokenKind };

const t = (text: string, kind: TokenKind = 'plain'): Token => ({ text, kind });
const str = (value: string) => t(`'${value}'`, 'str');
const list = (values: readonly string[], sep: string, sepKind: TokenKind) =>
  values.flatMap((v, i) => (i === 0 ? [str(v)] : [t(sep, sepKind), str(v)]));

/** The Trey.tsx source shown in the editor; every default reflects the live props. */
export function treySourceLines(p: TreyProps): Token[][] {
  return [
    [t('type', 'kw'), t(' '), t('Mood', 'tag'), t(' = '), ...list(MOODS, ' | ', 'punct'), t(';', 'punct')],
    [],
    [t('export function', 'kw'), t(' '), t('Trey', 'tag'), t('({', 'punct')],
    [t('  '), t('role', 'prop'), t(' = '), str('Principal Engineer'), t(',', 'punct')],
    [t('  '), t('mood', 'prop'), t(' = '), str(p.mood), t(',', 'punct')],
    [t('  '), t('focus', 'prop'), t(' = '), str(p.focus), t(',', 'punct')],
    [t('  '), t('coffee', 'prop'), t(' = '), t(String(p.coffee), 'num'), t(',', 'punct')],
    [t('  '), t('stack', 'prop'), t(' = '), t('[', 'punct'), ...list(p.stack, ', ', 'punct'), t('],', 'punct')],
    [t('}: ', 'punct'), t('TreyProps', 'tag'), t(') {', 'punct')],
    [t('  '), t('return', 'kw'), t(' '), t('<Engineer', 'tag'), t(' {...', 'punct'), t('props', 'prop'), t('}', 'punct'), t(' />', 'tag'), t(';', 'punct')],
    [t('}', 'punct')],
  ];
}

export const lineText = (line: readonly Token[]) => line.map((token) => token.text).join('');
