import { Post } from './posts'

export interface Stream {
    id: string
    name: string
    color: string
    curator: string
    cluster: string
    posts: Post[]
}

export const mockStreams: Stream[] = [
    // Literature Cluster (expanded from Classical Literature)
    {
        id: 'roman-literature',
        name: 'Roman Literature',
        color: '#8B4513',
        curator: 'Cicero_Admirer',
        cluster: 'Literature',
        posts: []
    },
    {
        id: 'greek-literature',
        name: 'Greek Literature',
        color: '#CD853F',
        curator: 'Plato_Scholar',
        cluster: 'Literature',
        posts: []
    },
    {
        id: 'victorian-literature',
        name: 'Victorian Literature',
        color: '#A0522D',
        curator: 'Dickens_Authority',
        cluster: 'Literature',
        posts: []
    },
    {
        id: 'medieval-manuscripts',
        name: 'Medieval Manuscripts',
        color: '#8B0000',
        curator: 'Bodleian_Keeper',
        cluster: 'Literature',
        posts: []
    },

    // Philosophy Cluster (expanded from Oxford Philosophy)
    {
        id: 'ancient-philosophy',
        name: 'Ancient Philosophy',
        color: '#841C26',
        curator: 'Aristotle_Expert',
        cluster: 'Philosophy',
        posts: []
    },
    {
        id: 'modern-philosophy',
        name: 'Modern Philosophy',
        color: '#AA336A',
        curator: 'Kant_Scholar',
        cluster: 'Philosophy',
        posts: []
    },
    {
        id: 'ethics-studies',
        name: 'Ethical Philosophy',
        color: '#702963',
        curator: 'Moral_Philosopher',
        cluster: 'Philosophy',
        posts: []
    },

    // Architecture Cluster (expanded from Ecclesiastical)
    {
        id: 'gothic-architecture',
        name: 'Gothic Architecture',
        color: '#1B365D',
        curator: 'Gothic_Expert',
        cluster: 'Architecture',
        posts: []
    },
    {
        id: 'romanesque-architecture',
        name: 'Romanesque Architecture',
        color: '#00416A',
        curator: 'Norman_Scholar',
        cluster: 'Architecture',
        posts: []
    },
    {
        id: 'cathedral-acoustics',
        name: 'Cathedral Acoustics',
        color: '#4B9CD3',
        curator: 'Sound_Architect',
        cluster: 'Architecture',
        posts: []
    },

    // Tea & Culture Cluster
    {
        id: 'tea-varieties',
        name: 'Tea Varieties',
        color: '#006B3C',
        curator: 'Tea_Connoisseur',
        cluster: 'Culture',
        posts: []
    },
    {
        id: 'tea-ceremony',
        name: 'Tea Ceremonies',
        color: '#00563F',
        curator: 'Ceremony_Master',
        cluster: 'Culture',
        posts: []
    },
    {
        id: 'teaware-studies',
        name: 'Historical Teaware',
        color: '#004225',
        curator: 'Porcelain_Expert',
        cluster: 'Culture',
        posts: []
    },

    // Sports & Recreation Cluster
    {
        id: 'test-cricket',
        name: 'Test Cricket',
        color: '#355E3B',
        curator: 'Test_Commentator',
        cluster: 'Sports',
        posts: []
    },
    {
        id: 'cricket-history',
        name: 'Cricket History',
        color: '#2E8B57',
        curator: 'Cricket_Historian',
        cluster: 'Sports',
        posts: []
    },

    // Natural Studies Cluster
    {
        id: 'british-birds',
        name: 'British Birds',
        color: '#00563F',
        curator: 'Royal_Ornithologist',
        cluster: 'Nature',
        posts: []
    },
    {
        id: 'garden-birds',
        name: 'Garden Ornithology',
        color: '#228B22',
        curator: 'Garden_Observer',
        cluster: 'Nature',
        posts: []
    },
    {
        id: 'migration-studies',
        name: 'Bird Migration',
        color: '#008000',
        curator: 'Migration_Expert',
        cluster: 'Nature',
        posts: []
    },

    // Classical Studies Cluster
    {
        id: 'latin-prose',
        name: 'Latin Prose',
        color: '#4B0082',
        curator: 'Latin_Scholar',
        cluster: 'Classics',
        posts: []
    },
    {
        id: 'greek-translation',
        name: 'Greek Translation',
        color: '#483D8B',
        curator: 'Greek_Translator',
        cluster: 'Classics',
        posts: []
    },
    {
        id: 'classical-reception',
        name: 'Classical Reception',
        color: '#6A5ACD',
        curator: 'Reception_Scholar',
        cluster: 'Classics',
        posts: []
    },
    {
        id: 'manuscript-studies',
        name: 'Manuscript Studies',
        color: '#800080',
        curator: 'Manuscript_Expert',
        cluster: 'Classics',
        posts: []
    }
];
