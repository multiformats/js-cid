export type Version = 0 | 1
export type Codec = string
export type Multihash = Buffer
export type BaseEncodedString = string
export type MultibaseName = string

export class CID {
  constructor(version: Version, codec: Codec, multhash: Multihash, multibaseName?: MultibaseName)
  constructor(cidStr: BaseEncodedString)
  constructor(cidBuf: Buffer)
  constructor(cidMultihash: Multihash)
  constructor(cid: CID)
  codec: Codec
  multihash: Multihash
  buffer: Buffer
  prefix: Buffer
  version: number
  toV0(): CID
  toV1(): CID
  toBaseEncodedString(base?: string): BaseEncodedString
  toString(): BaseEncodedString
  toJSON(): { codec: Codec, version: Version, hash: Multihash }
  equals(other: any): boolean
  static codecs: Record<Codec, Buffer>
  static isCID(mixed: any): boolean
  static validateCID(other: any): void
}

export default CID
