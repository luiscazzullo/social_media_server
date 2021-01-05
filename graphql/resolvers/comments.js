const Post = require("../../models/Post");
const checkAuth = require('../../utils/check-auth');
const { UserInputError, AuthenticationError } = require('apollo-server');
const posts = require("./posts");

module.exports = {
  Mutation: {
    createComment: async (_, { postId, body }, context) => {
      const { username } = checkAuth(context);
      if(body.trim() === '') {
        throw new UserInputError('Comentario vacío', {
          errors: {
            body: 'No se puede enviar un comentario vacío'
          }
        })
      }
      try {
        const post = await Post.findById(postId);
        if(post) {
          post.comments.unshift({
            body,
            username,
            createdAt: new Date().toISOString()
          })
          await post.save();
          return post;
        } else {
          throw new UserInputError('Post no existe');
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    deleteComment: async (_, { postId, commentId }, context) => {
      const { username } = checkAuth(context);
      try {
        const post = await Post.findById(postId);
        if(post) {
          const commentIndex = post.comments.findIndex(comment => comment.id === commentId);
          if(post.comments[commentIndex].username === username) {
            post.comments.splice(commentIndex, 1);
            await post.save();
            return post;
          } else {
            throw new AuthenticationError('Action not allowed');
          }
        }
      } catch (error) {
        throw new Error(error);
      }
    }
  }
}