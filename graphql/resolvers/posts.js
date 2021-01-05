const Post = require("../../models/Post");
const checkAuth = require('../../utils/check-auth');
const { AuthenticationError, UserInputError } = require('apollo-server');

module.exports = {
  Query: {
    getPost: async (_, { postId }) => {
      try {
        const post = await Post.findById(postId);
        if (post) {
          return post;
        } else {
          throw new Error('Post no encontrado')
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    getPosts: async () => {
      try {
        const posts = await Post.find().sort({ createdAt: 1 });
        return posts;
      } catch (error) {
        throw new Error(error)
      }
    }
  },
  Mutation: {
    createPost: async (_, { body }, context) => {
      const user = checkAuth(context);
      if(body.trim() === '') {
        throw new Error('Post no debe viajar vacío');
      }
      const newPost = new Post({
        body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString()
      })
      const post = await newPost.save();
      context.pubsub.publish('NEW_POST', {
        newPost: post
      });
      return post;
    },
    deletePost: async (_, { postId }, context) => {
      const user = checkAuth(context);
      try {
        const post = await Post.findById(postId);
        if(user.username === post.username) {
          await post.delete();
          return 'El post fue borrado exitosamente'
        } else {
          throw new AuthenticationError('Action not allowed')
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    likePost: async (_, { postId }, context) => {
      const { username } = checkAuth(context);
      const post = await Post.findById(postId);
      if(post) {
        if(post.likes.find(like => like.username === username)) {
          post.likes = post.likes.filter(like => like.username !== username);
        } else {
          post.likes.push({
            username,
            createdAt: new Date().toISOString()
          })
        }
        await post.save();
        return post;
      } else {
        throw new UserInputError('Post no encontrado');
      }
    }
  },
  Subscription: {
    newPost: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_POST')
    }
  }
}