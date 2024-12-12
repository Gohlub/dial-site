import { Post } from './posts'

export interface Stream {
    id: string
    name: string
    color: string
    curator: string
    posts: Post[]
}

export const mockStreams: Stream[] = [
    {
        id: 'classical-literature',
        name: 'Classical Literature',
        color: '#8B4513', // A dignified sepia
        curator: 'Jeeves_Actual',
        posts: []  // We'll populate this from posts.ts
    },
    {
        id: 'tea-appreciation',
        name: 'Fine Teas & Ceremony',
        color: '#006B3C', // British racing green
        curator: 'Earl_Grey_Enthusiast',
        posts: []
    },
    {
        id: 'oxford-philosophy',
        name: 'Oxford Philosophy',
        color: '#841C26', // Oxford burgundy
        curator: 'Magdalen_Scholar',
        posts: []
    },
    {
        id: 'ecclesiastical-architecture',
        name: 'Cathedral Architecture',
        color: '#1B365D', // Cathedral blue
        curator: 'Gothic_Revivalist',
        posts: []
    },
    {
        id: 'cricket-commentary',
        name: 'Cricket & Commentary',
        color: '#355E3B', // Lords green
        curator: 'Test_Match_Special',
        posts: []
    },
    {
        id: 'rare-manuscripts',
        name: 'Rare Manuscripts',
        color: '#8B0000', // Ancient manuscript red
        curator: 'Bodleian_Keeper',
        posts: []
    },
    {
        id: 'british-birds',
        name: 'British Ornithology',
        color: '#00563F', // Audubon green
        curator: 'Royal_Society_Fellow',
        posts: []
    },
    {
        id: 'latin-quotations',
        name: 'Latin Quotations',
        color: '#4B0082', // Imperial purple
        curator: 'Classics_Don',
        posts: []
    }
]
