import {gql, useQuery} from '@apollo/client'
import {useState} from 'react'

const ALL_BOOKS = gql`
  query allBooks($genre: [String]) {
    allBooks(genre: $genre) {
      title
      author  {
        name
        born
      }
      published
    }
  }
`

const ALL_GENRES = gql`
  query {
    allGenres
  }
`

const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState(null)
  const genres = useQuery(ALL_GENRES, {
    pollInterval: 2000
  })
  const books = useQuery(ALL_BOOKS, {
    variables: {genre: selectedGenre ? [selectedGenre] : null},
    pollInterval: 2000
  })
  console.log(books.data, genres.data)

  if (!props.show) {
    return null
  }

  if (books.loading || genres.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.data.allBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {genres.data.allGenres.map(g => 
          <button key={g} onClick={() => setSelectedGenre(g)}>{g}</button>
        )}
        <button onClick={() => setSelectedGenre(null)}>all genres</button>
      </div>
    </div>
  )
}

export default Books
