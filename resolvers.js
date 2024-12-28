const Author = require('./models/Author')
const Book = require('./models/Book')  
const User = require('./models/User') 
const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')

const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (r, args) => {
        let f_books = {}
        if (args.author) {
            const author = await Author.findOne({name: args.author})  
            f_books.author = author ? author.id : null
        }
        if (args.genre) {
           f_books.genres = { $in: args.genre }
        }
        return Book.find(f_books).populate('author')
    },
    allAuthors: async (r, args) => {
        const result = await Author.find({})
        return result 
    },
    allGenres: async () => {
        books = await Book.find({})
        const genres = books.reduce((a, book) => {
            book.genres.forEach(g => {
                if (!a.includes(g)) {
                    a.push(g)
                }
            })
            return a
        }
        , [])
        return genres
    },
    me: (r, args, context) => {
        return context.currentUser
    },
    recommendations: async (r, args, context) => {
        const currentUser = context.currentUser
        if (!currentUser) {
            throw new GraphQLError('not authenticated', {
                extensions:{
                    code: 'BAD_USER_INPUT',
                }
            })
        }
        const books = await Book.find({genres: { $in: [currentUser.favoriteGenre] }}).populate('author')
        return books
    }
  },
  Author: {
    bookCount: (r) => Book.collection.countDocuments({author: r._id}),
    name : (author) => author.name || undefined
  },
  Mutation: {
    addBook: async (r, args, context) => {
        const currentUser = context.currentUser

        if (!currentUser) {
            throw new GraphQLError('not authenticated', {
                extensions:{
                    code: 'BAD_USER_INPUT',
                }
            })
        }
        
        try {
            let author = await Author.findOne({ name: args.author })
            if (!author) {
                author = new Author({ name: args.author })
                await author.save()
            }
            const book = new Book({ ...args, author: author._id })
            await book.save()
            pubsub.publish('BOOK_ADDED', { bookAdded: book })
            return book.populate('author')
        } catch (e) {
            throw new GraphQLError(e.message, {
                extensions:{
                    code: 'BAD_USER_INPUT',
                    invalidArgs: args.name,
                    e
                }
            })
        }

    },
    editAuthor: async (r, args, {currentUser}) => {
        if (!currentUser) {
            throw new GraphQLError('not authenticated', {
                extensions:{
                    code: 'BAD_USER_INPUT',
                }
            })
        }

        const author = await Author.findOne({name: args.name})
        if (!author) {
            return null
        }
        author.born = args.setBornTo
        try {
            await author.save()
        } catch (e) {
            throw new GraphQLError(e.message, {
                extensions:{
                    code: 'BAD_USER_INPUT',
                    invalidArgs: args.name,
                    e
                }
            })
        }
        return author
    },
    createUser: async (r, args) => {
        const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
        try {
            await user.save()
        } catch (e) {
            throw new GraphQLError(e.message, {
                extensions:{
                    code: 'BAD_USER_INPUT',
                    invalidArgs: args.name,
                    e
                }
            })
        }
        return user
    },
    login: async (r, args) => {
        const user = await User.findOne({ username: args.username })

        if (!user || args.password !== 'secret') {
            throw new GraphQLError('wrong credentials', {
                extensions:{
                    code: 'BAD_USER_INPUT',
                }
            })
        }
        const userForToken = {
            username: user.username,
            id: user._id,
        }
        return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
        }
    },
    Subscription: {
        bookAdded: {
            subscribe: () =>{
                console.log('subscribing')  
                return pubsub.asyncIterableIterator(['BOOK_ADDED'])}
        }
    }
}

module.exports = resolvers
