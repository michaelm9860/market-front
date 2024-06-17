import { useParams } from "react-router-dom";
import { PostsList } from "../../@types/PostsList";
import styles from "./entitiesAll.module.scss";
import { PostsService } from "../../services/posts-service";
import { Post } from "../../@types/Post";
import { useEffect, useState } from "react";
import { Dialogues } from "../../ui/Dialogues";
import CardsDisplay from "../../components/card/CardsDisplay";
import Card from "../../components/card/Card";

const SearchResults = () => {
  const { query } = useParams();

  const queryParam = query as string;
  const [selectedSearchOption, setSelectedSearchOption] = useState<string>("name");
  const [currentSearchOption, setCurrentSearchOption] = useState<JSX.Element | null>(null);
  const [postsByName, setPostsByName] = useState<Post[]>([]);
  const [postsByCategory, setPostsByCategory] = useState<Post[]>([]);
  const [currentKey, setCurrentKey] = useState<number>(1);

  const searchPostsByName = async () => {
    try {
      const res: PostsList = await PostsService.getAllPosts(0, 1000); // Fetch all posts
      setPostsByName(
        res.posts.filter((post) => post.productName.includes(queryParam))
      );
    } catch (error: any) {
      try {
        const errorData = JSON.parse(error.message);
        Dialogues.error(errorData.message);
      } catch (parseError) {
        Dialogues.error();
      }
    }
  };

  const searchPostsByCategory = async () => {
    try {
      const res: PostsList = await PostsService.getAllPosts(0, 1000); // Fetch all posts
      setPostsByCategory(
        res.posts.filter((post) => post.category.includes(queryParam))
      );
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
    if (selectedSearchOption === "name") {
      searchPostsByName();
    } else if (selectedSearchOption === "category") {
      searchPostsByCategory();
    }
    setCurrentKey((prevKey) => prevKey + 1);
  }, [selectedSearchOption, queryParam]);

  useEffect(() => {
    if (selectedSearchOption === "name") {
      setCurrentSearchOption(
        <CardsDisplay>
          {postsByName?.map((post) => (
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
      );
    } else if (selectedSearchOption === "category") {
      setCurrentSearchOption(
        <CardsDisplay>
          {postsByCategory?.map((post) => (
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
      );
    }
  }, [postsByName, postsByCategory, selectedSearchOption]);

  return (
    <div className={styles.pageContainer} key={currentKey}>
      <h2>Search Results</h2>
      <div className={styles.searchOptionsBtns}
      >
        <button onClick={() => setSelectedSearchOption("name")}>Posts by name</button>
        <button onClick={() => setSelectedSearchOption("category")}>Posts by category</button>
      </div>
      {currentSearchOption}
    </div>
  );
};

export default SearchResults;
