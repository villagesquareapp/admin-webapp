

interface PageSearchParams {
    query?: string
}

type SearchParamsAction = string

interface ActionOperatorPair {
    action: SearchParamsAction
    operator: string
}
