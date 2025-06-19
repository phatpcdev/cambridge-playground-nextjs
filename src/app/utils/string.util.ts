import { isNil, isString } from "lodash"

export const parseJson = (strJson?: unknown) => {
  if (isNil(strJson) || !isString(strJson)) return undefined

  try {
    console.log(JSON.parse(strJson))
    return JSON.parse(strJson)
  } catch {
    return undefined
  }
}