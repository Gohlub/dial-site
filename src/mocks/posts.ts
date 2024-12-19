// Populate streams with their respective posts
import { mockStreams } from './streams'

export interface Post {
    id: string
    streamId: string
    title: string
    content: string
    author: string
    date: string
}

export const mockPosts: Post[] = [
    {
        id: 'tv1',
        streamId: 'tea-varieties',
        title: 'The Complex Profile of First Flush Darjeeling',
        content: 'An examination of the muscatel notes...',
        author: 'Tea_Connoisseur',
        date: '2024-03-20'
    },
    {
        id: 'tv2',
        streamId: 'tea-varieties',
        title: 'Comparing Chinese and Japanese Green Teas',
        content: 'The steaming versus roasting debate...',
        author: 'Tea_Connoisseur',
        date: '2024-03-19'
    },
    {
        id: 'tv3',
        streamId: 'tea-varieties',
        title: 'Oolong Processing Methods',
        content: 'Traditional versus modern oxidation techniques...',
        author: 'Tea_Connoisseur',
        date: '2024-03-18'
    },
    {
        id: 'tv4',
        streamId: 'tea-varieties',
        title: 'The Rarest Puerh Varieties',
        content: 'Examining pre-1950 cave-aged specimens...',
        author: 'Tea_Master',
        date: '2024-03-17'
    },
    {
        id: 'tv5',
        streamId: 'tea-varieties',
        title: 'Ceylon High Mountain Teas',
        content: 'Altitude effects on flavor profiles...',
        author: 'Tea_Connoisseur',
        date: '2024-03-16'
    },
    {
        id: 'tv6',
        streamId: 'tea-varieties',
        title: 'White Tea Classification',
        content: 'Beyond Silver Needle standards...',
        author: 'Tea_Master',
        date: '2024-03-15'
    },
    {
        id: 'tv7',
        streamId: 'tea-varieties',
        title: 'Assam Second Flush Characteristics',
        content: 'Malt notes and brewing techniques...',
        author: 'Tea_Connoisseur',
        date: '2024-03-14'
    },
    {
        id: 'tv8',
        streamId: 'tea-varieties',
        title: 'Yellow Tea Processing',
        content: 'The rarest of Chinese classics...',
        author: 'Tea_Master',
        date: '2024-03-13'
    },
    {
        id: 'tv9',
        streamId: 'tea-varieties',
        title: 'Keemun Grading Systems',
        content: 'Understanding Hao Ya classifications...',
        author: 'Tea_Connoisseur',
        date: '2024-03-12'
    },
    {
        id: 'tv10',
        streamId: 'tea-varieties',
        title: 'Taiwanese High Mountain Oolong',
        content: 'Elevation and flavor correlation...',
        author: 'Tea_Master',
        date: '2024-03-11'
    },
    {
        id: 'tv11',
        streamId: 'tea-varieties',
        title: 'Gyokuro Shading Techniques',
        content: 'Traditional bamboo versus modern methods...',
        author: 'Tea_Connoisseur',
        date: '2024-03-10'
    },    // Roman Literature (10 posts)
    {
        id: 'rl1',
        streamId: 'roman-literature',
        title: 'Virgil\'s Pastoral Influences',
        content: 'An analysis of the Eclogues...',
        author: 'Cicero_Admirer',
        date: '2024-03-20'
    },
    {
        id: 'rl2',
        streamId: 'roman-literature',
        title: 'Ovid\'s Metamorphoses: Structure Analysis',
        content: 'The mathematical precision of transformations...',
        author: 'Cicero_Admirer',
        date: '2024-03-19'
    },
    {
        id: 'rl3',
        streamId: 'roman-literature',
        title: 'Horace\'s Odes: Metrical Innovation',
        content: 'Greek influences in Latin verse...',
        author: 'Latin_Scholar',
        date: '2024-03-18'
    },
    {
        id: 'rl4',
        streamId: 'roman-literature',
        title: 'Cicero\'s Rhetorical Devices',
        content: 'Patterns in the Philippics...',
        author: 'Cicero_Admirer',
        date: '2024-03-17'
    },
    {
        id: 'rl5',
        streamId: 'roman-literature',
        title: 'Juvenal\'s Satirical Techniques',
        content: 'The art of Roman mockery...',
        author: 'Latin_Scholar',
        date: '2024-03-16'
    },
    {
        id: 'rl6',
        streamId: 'roman-literature',
        title: 'Lucan\'s Civil War Epic',
        content: 'Historical accuracy in verse...',
        author: 'Cicero_Admirer',
        date: '2024-03-15'
    },
    {
        id: 'rl7',
        streamId: 'roman-literature',
        title: 'Martial\'s Epigrams: Social Commentary',
        content: 'Roman society through wit...',
        author: 'Latin_Scholar',
        date: '2024-03-14'
    },
    {
        id: 'rl8',
        streamId: 'roman-literature',
        title: 'Pliny\'s Letters: Administrative Style',
        content: 'The art of official correspondence...',
        author: 'Cicero_Admirer',
        date: '2024-03-13'
    },
    {
        id: 'rl9',
        streamId: 'roman-literature',
        title: 'Tacitus: Historical Method',
        content: 'Bias and objectivity in ancient history...',
        author: 'Latin_Scholar',
        date: '2024-03-12'
    },
    {
        id: 'rl10',
        streamId: 'roman-literature',
        title: 'Seneca\'s Philosophical Prose',
        content: 'Stoicism in literary form...',
        author: 'Cicero_Admirer',
        date: '2024-03-11'
    },

    // Gothic Architecture (10 posts)
    {
        id: 'ga1',
        streamId: 'gothic-architecture',
        title: 'Flying Buttress Evolution',
        content: 'Structural development through centuries...',
        author: 'Gothic_Expert',
        date: '2024-03-20'
    },
    // ... [Similar detailed posts for Gothic Architecture]

    // Test Cricket (8 posts)
    {
        id: 'tc1',
        streamId: 'test-cricket',
        title: 'The Art of Declaration Timing',
        content: 'Strategic considerations in Test matches...',
        author: 'Test_Commentator',
        date: '2024-03-20'
    },
    // ... [Similar detailed posts for Test Cricket]

    // Greek Literature (8 posts)
    {
        id: 'gl1',
        streamId: 'greek-literature',
        title: 'Homer\'s Metrical Patterns',
        content: 'Dactylic hexameter analysis...',
        author: 'Plato_Scholar',
        date: '2024-03-20'
    },
    {
        id: 'cl1',
        streamId: 'classical-literature',
        title: 'On the Particular Genius of P.G. Wodehouse',
        content: 'The psychology of the individual, as demonstrated in "The Code of the Woosters," reveals a profound understanding of the human condition...',
        author: 'Jeeves_Actual',
        date: '2024-03-20'
    },
    {
        id: 'cl2',
        streamId: 'classical-literature',
        title: 'Evelyn Waugh: The Early Years',
        content: 'Before "Brideshead Revisited," there was "Decline and Fall" — a masterwork of satirical precision...',
        author: 'Jeeves_Actual',
        date: '2024-03-19'
    },
    {
        id: 'cl3',
        streamId: 'classical-literature',
        title: 'The Influence of Drones Club on Modern Literature',
        content: 'One cannot overstate the impact of Wodehouse\'s fictional gentlemen\'s club on subsequent portrayals of English society...',
        author: 'Jeeves_Actual',
        date: '2024-03-18'
    },
    {
        id: 'cl4',
        streamId: 'classical-literature',
        title: 'Anthony Trollope\'s Barsetshire: A Cultural Analysis',
        content: 'The ecclesiastical politics of Barchester reveal more about Victorian society than any historical treatise...',
        author: 'Jeeves_Actual',
        date: '2024-03-17'
    },
    {
        id: 'cl5',
        streamId: 'classical-literature',
        title: 'The Perfect Butler in Literature',
        content: 'From Stevens in "Remains of the Day" to Jeeves himself, the literary butler serves as society\'s perfect observer...',
        author: 'Jeeves_Actual',
        date: '2024-03-16'
    },
    {
        id: 'ta1',
        streamId: 'tea-appreciation',
        title: 'The Proper Preparation of Darjeeling First Flush',
        content: 'One must never, under any circumstances, exceed 85°C when steeping this most delicate of teas...',
        author: 'Earl_Grey_Enthusiast',
        date: '2024-03-20'
    },
    {
        id: 'ta2',
        streamId: 'tea-appreciation',
        title: 'On the Superiority of Bone China',
        content: 'The translucency achieved by proper bone china cannot be replicated by mere porcelain...',
        author: 'Earl_Grey_Enthusiast',
        date: '2024-03-19'
    },
    {
        id: 'ta3',
        streamId: 'tea-appreciation',
        title: 'The Lost Art of the Tea Cozy',
        content: 'Modern brewing methods have regrettably abandoned this essential instrument of heat retention...',
        author: 'Earl_Grey_Enthusiast',
        date: '2024-03-18'
    },
    {
        id: 'ta4',
        streamId: 'tea-appreciation',
        title: 'Ceylon vs. Assam: A Comparative Study',
        content: 'While both are breakfast teas, the distinction in terroir produces markedly different results...',
        author: 'Earl_Grey_Enthusiast',
        date: '2024-03-17'
    },
    {
        id: 'ta5',
        streamId: 'tea-appreciation',
        title: 'The Correct Position of the Little Finger',
        content: 'Contrary to popular belief, the extended pinky is a modern affectation without historical basis...',
        author: 'Earl_Grey_Enthusiast',
        date: '2024-03-16'
    },
    {
        id: 'op1',
        streamId: 'oxford-philosophy',
        title: 'A Defense of Berkeley\'s Immaterialism',
        content: 'To be is to be perceived — a proposition that continues to vex materialists to this very day...',
        author: 'Magdalen_Scholar',
        date: '2024-03-20'
    },
    {
        id: 'op2',
        streamId: 'oxford-philosophy',
        title: 'Ryle\'s Ghost: A Modern Interpretation',
        content: 'The category mistake identified in "The Concept of Mind" remains relevant to contemporary discussions of consciousness...',
        author: 'Magdalen_Scholar',
        date: '2024-03-19'
    },
    {
        id: 'op3',
        streamId: 'oxford-philosophy',
        title: 'On Strawson\'s Descriptive Metaphysics',
        content: 'The distinction between descriptive and revisionary metaphysics deserves renewed attention...',
        author: 'Magdalen_Scholar',
        date: '2024-03-18'
    },
    {
        id: 'op4',
        streamId: 'oxford-philosophy',
        title: 'Austin and Ordinary Language',
        content: 'The Oxford ordinary language philosophy movement\'s contribution to linguistic analysis remains underappreciated...',
        author: 'Magdalen_Scholar',
        date: '2024-03-17'
    },
    {
        id: 'op5',
        streamId: 'oxford-philosophy',
        title: 'Anscombe\'s Intention: A Critical Review',
        content: 'The distinction between theoretical and practical knowledge in intentional action requires further examination...',
        author: 'Magdalen_Scholar',
        date: '2024-03-16'
    },
    {
        id: 'ea1',
        streamId: 'ecclesiastical-architecture',
        title: 'Flying Buttresses: Form and Function',
        content: 'The theological implications of Gothic architecture cannot be overstated, as evidenced by Suger\'s writings on Saint-Denis...',
        author: 'Gothic_Revivalist',
        date: '2024-03-20'
    },
    {
        id: 'ea2',
        streamId: 'ecclesiastical-architecture',
        title: 'The Rose Windows of Chartres',
        content: 'The mathematical precision of the northern rose window represents the perfect marriage of sacred geometry and divine inspiration...',
        author: 'Gothic_Revivalist',
        date: '2024-03-19'
    },
    {
        id: 'ea3',
        streamId: 'ecclesiastical-architecture',
        title: 'Norman vs. Gothic: A Study in Transitions',
        content: 'The evolution from rounded to pointed arches marks not merely an architectural shift, but a fundamental change in medieval thought...',
        author: 'Gothic_Revivalist',
        date: '2024-03-18'
    },
    {
        id: 'ea4',
        streamId: 'ecclesiastical-architecture',
        title: 'The Acoustic Properties of Cistercian Abbeys',
        content: 'The remarkable acoustic properties of Cistercian churches were no accident, but rather a careful application of classical harmonic principles...',
        author: 'Gothic_Revivalist',
        date: '2024-03-17'
    },
    {
        id: 'ea5',
        streamId: 'ecclesiastical-architecture',
        title: 'Pugin\'s True Principles Revisited',
        content: 'In our age of architectural relativism, Pugin\'s insistence on truth in construction becomes ever more pertinent...',
        author: 'Gothic_Revivalist',
        date: '2024-03-16'
    },
    {
        id: 'cc1',
        streamId: 'cricket-commentary',
        title: 'The Art of the Late Cut',
        content: 'As the shadows lengthen across the pavilion at Lords, one reflects upon the sheer elegance of Boycott\'s technique...',
        author: 'Test_Match_Special',
        date: '2024-03-20'
    },
    {
        id: 'cc2',
        streamId: 'cricket-commentary',
        title: 'In Defense of the Forward Defensive',
        content: 'While the modern game favors flamboyant stroke play, there remains something quintessentially cricket about a properly executed forward defensive...',
        author: 'Test_Match_Special',
        date: '2024-03-19'
    },
    {
        id: 'cc3',
        streamId: 'cricket-commentary',
        title: 'The Proper Application of Linseed Oil',
        content: 'The annual ritual of bat preparation speaks to cricket\'s deeper connection with the natural world...',
        author: 'Test_Match_Special',
        date: '2024-03-18'
    },
    {
        id: 'cc4',
        streamId: 'cricket-commentary',
        title: 'Weather and Declaration Timing',
        content: 'The approaching cumulus clouds over long-on must always factor into a captain\'s declaration calculations...',
        author: 'Test_Match_Special',
        date: '2024-03-17'
    },
    {
        id: 'cc5',
        streamId: 'cricket-commentary',
        title: 'Tea Interval Etiquette',
        content: 'The proper ordering of scones, cucumber sandwiches, and Earl Grey remains as vital to the game as any LBW law...',
        author: 'Test_Match_Special',
        date: '2024-03-16'
    },
    {
        id: 'rm1',
        streamId: 'rare-manuscripts',
        title: 'Recent Discoveries in the Cotton Library',
        content: 'A previously unknown marginalia in MS Cotton Vitellius A.xv suggests a fascinating connection to the Lindisfarne Gospels...',
        author: 'Bodleian_Keeper',
        date: '2024-03-20'
    },
    {
        id: 'rm2',
        streamId: 'rare-manuscripts',
        title: 'On the Proper Handling of Vellum',
        content: 'The ambient humidity in manuscript reading rooms should never, under any circumstances, fall below 45%...',
        author: 'Bodleian_Keeper',
        date: '2024-03-19'
    },
    {
        id: 'rm3',
        streamId: 'rare-manuscripts',
        title: 'Illuminated Capitals in the Digital Age',
        content: 'While digitization provides accessibility, it cannot capture the true luminosity of gold leaf under candlelight...',
        author: 'Bodleian_Keeper',
        date: '2024-03-18'
    },
    {
        id: 'rm4',
        streamId: 'rare-manuscripts',
        title: 'The Lost Folios of the Exeter Book',
        content: 'New ultraviolet analysis suggests the missing pages may have contained previously unknown Old English riddles...',
        author: 'Bodleian_Keeper',
        date: '2024-03-17'
    },
    {
        id: 'rm5',
        streamId: 'rare-manuscripts',
        title: 'Proper Tea Stain Removal Techniques',
        content: 'One shudders to think how many priceless manuscripts have been compromised by overzealous cleaning attempts...',
        author: 'Bodleian_Keeper',
        date: '2024-03-16'
    },
    {
        id: 'bb1',
        streamId: 'british-birds',
        title: 'On the Migration Patterns of the Common Snipe',
        content: 'The peculiar drumming sound produced by their outer tail feathers during courtship flights has long puzzled ornithologists...',
        author: 'Royal_Society_Fellow',
        date: '2024-03-20'
    },
    {
        id: 'bb2',
        streamId: 'british-birds',
        title: 'The Decline of the House Sparrow',
        content: 'The disappearance of this once-common bird from London\'s squares represents a troubling shift in urban ecology...',
        author: 'Royal_Society_Fellow',
        date: '2024-03-19'
    },
    {
        id: 'bb3',
        streamId: 'british-birds',
        title: 'Proper Maintenance of Brass Binoculars',
        content: 'The superior light-gathering properties of properly maintained pre-war Zeiss instruments remain unmatched...',
        author: 'Royal_Society_Fellow',
        date: '2024-03-18'
    },
    {
        id: 'bb4',
        streamId: 'british-birds',
        title: 'The Return of the Red Kite',
        content: 'The success of reintroduction programs in the Chilterns offers hope for other species, though one must remain vigilant...',
        author: 'Royal_Society_Fellow',
        date: '2024-03-17'
    },
    {
        id: 'bb5',
        streamId: 'british-birds',
        title: 'Field Notes: The Proper Paper',
        content: 'In inclement weather, the superiority of a proper moleskine notebook cannot be overstated...',
        author: 'Royal_Society_Fellow',
        date: '2024-03-16'
    },
    {
        id: 'lq1',
        streamId: 'latin-quotations',
        title: 'Proper Usage of "Quantum Sufficit"',
        content: 'One observes with dismay the frequent misapplication of this phrase in modern pharmaceutical contexts...',
        author: 'Classics_Don',
        date: '2024-03-20'
    },
    {
        id: 'lq2',
        streamId: 'latin-quotations',
        title: 'Common Errors in Medical Latin',
        content: 'The confusion between "pro re nata" and "pro tempore" in modern prescriptions is nothing short of scandalous...',
        author: 'Classics_Don',
        date: '2024-03-19'
    },
    {
        id: 'lq3',
        streamId: 'latin-quotations',
        title: 'In Defense of the Subjunctive',
        content: 'The gradual erosion of the subjunctive mood in modern Latin usage suggests a troubling decline in precision of thought...',
        author: 'Classics_Don',
        date: '2024-03-18'
    },
    {
        id: 'lq4',
        streamId: 'latin-quotations',
        title: 'On the Proper Citation of Cicero',
        content: 'The modern tendency to cite by page number rather than by book and section must be resisted at all costs...',
        author: 'Classics_Don',
        date: '2024-03-17'
    },
    {
        id: 'lq5',
        streamId: 'latin-quotations',
        title: 'The Oxford Comma in Latin Lists',
        content: 'While the Romans themselves used no punctuation, the clarity provided by the Oxford comma in Latin translation is invaluable...',
        author: 'Classics_Don',
        date: '2024-03-16'
    }
]

export const populateStreams = () => {
    mockStreams.forEach(stream => {
        stream.posts = mockPosts.filter(post => post.streamId === stream.id)
    })
    return mockStreams
}

populateStreams()