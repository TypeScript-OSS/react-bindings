let globalInc = 0;

/** Make an ID that is unique to at least this runtime */
export const makeUID = () => `id${globalInc++}`;
