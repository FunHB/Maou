const level = ['level', 'poziom', 'lvl'] as const
const posts = ['posts', 'posty'] as const
const mPosts = ['mposts', 'mposty', 'postym'] as const

type LevelTopTypes = (typeof level)[number]
type PostsTopTypes = (typeof posts)[number]
type MpostsTopTypes = (typeof mPosts)[number]

export type TopType = LevelTopTypes | PostsTopTypes | MpostsTopTypes

export const checkType = (type: TopType): number => {
    if (level.includes(type as LevelTopTypes)) return 0
    if (posts.includes(type as PostsTopTypes)) return 1
    if (mPosts.includes(type as MpostsTopTypes)) return 2
    return -1
}