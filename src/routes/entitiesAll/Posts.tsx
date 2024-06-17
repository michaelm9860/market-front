import { useEffect, useState } from "react";
import { Post } from "../../@types/Post";
import { PostsList } from "../../@types/PostsList";
import Card from "../../components/card/Card";
import CardsDisplay from "../../components/card/CardsDisplay";
import { PostsService } from "../../services/posts-service";
import { Dialogues } from "../../ui/Dialogues";
import styles from "./entitiesAll.module.scss";

const Posts = () => {
  const [postsPage, setPostsPage] = useState<Post[]>();

  const [currentPage, setCurrentPage] = useState<number>(0);

  const [lastPage, setLastPage] = useState<number>();

  const getAllPosts = async (pageNum: number) => {
    try {
      const posts: PostsList = await PostsService.getAllPosts(pageNum, 12);
      setPostsPage(posts.posts);
      setLastPage(posts.totalPages);
    } catch (error: any) {
      try {
        const errorData = JSON.parse(error.message);
        Dialogues.error(errorData.message);
      } catch (parseError) {
        Dialogues.error();
      }
    }
  };

  useEffect(() => {
    getAllPosts(0);
  }, []);

  const nextPage = () => {
    if (lastPage) {
      if (currentPage < lastPage - 1) {
        getAllPosts(currentPage + 1);
        setCurrentPage(currentPage + 1);
      }
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      getAllPosts(currentPage - 1);
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h2>All Posts</h2>
      <CardsDisplay>
        {postsPage?.map((post) => (
          <Card
            key={post.id}
            id={post.id}
            image={post.pictures[0]}
            name={post.productName}
            additionalDetail={`${post.currency} ${post.price}`}
            objectType="post"
            objectTypeUrl="posts"
          />
        ))}
      </CardsDisplay>
      <div className={styles.btnContainer}>
        <button onClick={nextPage}>
          <i className="bi bi-chevron-double-left"></i>
        </button>
        <button onClick={prevPage}>
          <i className="bi bi-chevron-double-right"></i>
        </button>
      </div>
    </div>
  );
};

export default Posts;
