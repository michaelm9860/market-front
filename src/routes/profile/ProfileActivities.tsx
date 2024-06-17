import { useEffect, useRef, useState } from "react";
import { Group } from "../../@types/Group";
import { Post } from "../../@types/Post";
import { User } from "../../@types/User";
import Card from "../../components/card/Card";
import CardsDisplay from "../../components/card/CardsDisplay";
import { GroupsService } from "../../services/groups-service";
import { PostsService } from "../../services/posts-service";
import styles from "./ProfileActivities.module.scss";

const ProfileActivities = ({ user }: { user: User }) => {
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<JSX.Element | null>(
    null
  );
  const postsBtnRef = useRef<HTMLButtonElement>(null);
  const savedPostsBtnRef = useRef<HTMLButtonElement>(null);
  const groupsBtnRef = useRef<HTMLButtonElement>(null);
  const pendingGroupsBtnRef = useRef<HTMLButtonElement>(null);
  const activitiesMenuRef = useRef<HTMLDivElement>(null);
  const [activityKey, setActivityKey] = useState(0);

  const updateActiveClass = (activity: string) => {
    postsBtnRef.current?.classList.toggle(
      styles.active,
      activity === "posts"
    );
    savedPostsBtnRef.current?.classList.toggle(
      styles.active,
      activity === "savedPosts"
    );
    groupsBtnRef.current?.classList.toggle(
      styles.active,
      activity === "groups"
    );
    pendingGroupsBtnRef.current?.classList.toggle(
      styles.active,
      activity === "pendingGroups"
    );
  };

  const nothingToShow = (message: string) => {
    return (
      <div className={styles.nothingToShow}>
        <h3>{message}</h3>
      </div>
    );
  };

  const userPosts = async () => {
    let userPosts: Post[] = [];

    if (activeUser && activeUser.id === user.id) {
      userPosts = [...user.posts];
    } else {
      for (let i = 0; i < user.posts.length; i++) {
        const post = await PostsService.getPostById(user.posts[i].id);
        userPosts.push(post);
      }
    }

    const sortedPosts = userPosts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (sortedPosts.length === 0) {
      return nothingToShow("No posts to show");
    } else {
      return (
        <CardsDisplay>
          {sortedPosts.map((post) => (
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
  };

  const userGroups = async () => {
    const groups: Group[] = [];
    for (let i = 0; i < user.groupIds.length; i++) {
      const group = await GroupsService.getGroupById(user.groupIds[i]);
      groups.push(group);
    }
    if (groups.length === 0) {
      return nothingToShow("No groups to show");
    } else {
      return (
        <CardsDisplay>
          {groups.map((group) => (
            <Card
              key={group.id}
              id={group.id}
              image={group.image}
              name={group.name}
              additionalDetail={
                group.private ? "Private group" : "Public group"
              }
              objectType="group"
              objectTypeUrl="groups"
            />
          ))}
        </CardsDisplay>
      );
    }
  };

  const userSavedPosts = async () => {
    const savedPosts: Post[] = [];
    for (let i = 0; i < user.savedPostsIds.length; i++) {
      const savedPost = await PostsService.getPostById(user.savedPostsIds[i]);
      savedPosts.push(savedPost);
    }
    if (savedPosts.length === 0) {
      return nothingToShow("No saved posts to show");
    } else {
      return (
        <CardsDisplay>
          {savedPosts.map((post) => (
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
  };

  const userPendingGroups = async () => {
    const pendingGroups: Group[] = [];
    for (let i = 0; i < user.groupsUserIsPendingIn.length; i++) {
      const pendingGroup = await GroupsService.getGroupById(
        user.groupsUserIsPendingIn[i]
      );
      pendingGroups.push(pendingGroup);
    }
    if (pendingGroups.length === 0) {
      return nothingToShow("No groups are pending membership approval");
    }
    return (
      <CardsDisplay>
        {pendingGroups.map((group) => (
          <Card
            key={group.id}
            id={group.id}
            image={group.image}
            name={group.name}
            additionalDetail={group.private ? "Private group" : "Public group"}
            objectType="group"
            objectTypeUrl="groups"
          />
        ))}
      </CardsDisplay>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      const activity = await userPosts();
      setSelectedActivity(activity);
      updateActiveClass("posts");
    };
    fetchData();
  }, [user, activeUser]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setActiveUser(JSON.parse(storedUser));
    }
  }, []);

  const enablePendingGroups = () => {
    activitiesMenuRef.current?.classList.add("max-sm:overflow-x-scroll");
    activitiesMenuRef.current?.classList.add("max-sm:scroll-smooth");
    activitiesMenuRef.current?.classList.add("max-sm:justify-start");

    return (
      <button
        className={styles.selectActivity}
        ref={pendingGroupsBtnRef}
        onClick={() => handleSelectActivity("pendingGroups")}
      >
        Pending Groups
      </button>
    );
  };

  const handleSelectActivity = async (activity: string) => {
    let component: JSX.Element | null = null;
    if (activity === "savedPosts") {
      component = await userSavedPosts();
    } else if (activity === "groups") {
      component = await userGroups();
    } else if (activity === "pendingGroups") {
      component = await userPendingGroups();
    } else {
      component = await userPosts();
    }
    setSelectedActivity(component);
    setActivityKey((prevKey) => prevKey + 1);
    updateActiveClass(activity);
  };

  return (
    <>
      <div className={styles.activitiesMenu} ref={activitiesMenuRef}>
        <button
          className={`${styles.selectActivity} ${styles.active}`}
          ref={postsBtnRef}
          onClick={() => handleSelectActivity("posts")}
        >
          Posts
        </button>
        <button
          className={styles.selectActivity}
          ref={savedPostsBtnRef}
          onClick={() => handleSelectActivity("savedPosts")}
        >
          Saved Posts
        </button>
        <button
          className={styles.selectActivity}
          ref={groupsBtnRef}
          onClick={() => handleSelectActivity("groups")}
        >
          Groups
        </button>
        {activeUser && activeUser.id === user.id && enablePendingGroups()}
      </div>
      <div className={styles.activityContainer}>
        <div className={styles.selectedActivity} key={activityKey}>
          {selectedActivity}
        </div>
      </div>
    </>
  );
};

export default ProfileActivities;
