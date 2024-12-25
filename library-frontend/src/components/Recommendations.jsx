import { gql, useQuery } from '@apollo/client'

const RECOMMENDATIONS = gql`
  query {
    recommendations {
      title
      author {
        name
        born
      }
      published
    }
  }
`

const ME = gql`
  query {
    me {
      favoriteGenre
    }
  }
`

const Recommendation = (props) => {
  const recommendations = useQuery(RECOMMENDATIONS)
  const me = useQuery(ME)
  console.log(recommendations)

  if (!props.show) {
    return null
  }

  if (recommendations.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>recommendations</h2>
      {recommendations.data.recommendations.length === 0 ? (<p>no recommendations for your favorite genre <b>{me.data.me.favoriteGenre}</b></p> ) : (
      <table>
        <p>books in your favorite genre <b>{me.data.me.favoriteGenre}</b></p>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {recommendations.data.recommendations.map((book) => (
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </div>
  )
}

export default Recommendation