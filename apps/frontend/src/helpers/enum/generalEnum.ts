export const EMatchFilter = {
    all: "all",
    unmatched: "unmatched",
    matched: "matched"
}
export type TMatchFilter = typeof EMatchFilter[keyof typeof EMatchFilter];