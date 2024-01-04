const { gql, GraphQLClient } = require('graphql-request');

const ENDPOINT = 'https://api-eu-west-2.hygraph.com/v2/clqozxyr2t9cj01t43o6d5148/master';


const fetchBlogs = async () => {

    try {
        const graphqlClient = new GraphQLClient(ENDPOINT);

        const query = gql`
            query Blogs {
                blogs(first: 4) {
                    author {
                    authorName
                    }
                    categories {
                    categoryName
                    }
                    id
                    preview
                    publishedAt
                    title
                    slug
                }
            }
        `;

        const res = await graphqlClient.request(query);
        const response = await res;
        console.log(response);
    } catch (error) {
        console.log("Something went wrong: ", error);
    }

}


fetchBlogs();