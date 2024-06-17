import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Group } from "../../@types/Group";
import { Post } from "../../@types/Post";
import { UpdateGroup } from "../../@types/UpdateGroup";
import { User } from "../../@types/User";
import Card from "../../components/card/Card";
import CardsDisplay from "../../components/card/CardsDisplay";
import { AuthContext } from "../../contexts/AuthContext";
import { FileService } from "../../services/file-service";
import { GroupsService } from "../../services/groups-service";
import { UserService } from "../../services/user-service";
import { Dialogues } from "../../ui/Dialogues";
import styles from "./Group.module.scss";
const GroupDetails = () => {
  const { id } = useParams();
  const idNum = parseInt(id ?? "");

  if (isNaN(idNum)) {
    throw new Error("Group id must be a number!");
  }

  const [group, setGroup] = useState<Group | null>(null);
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const [showDescription, setShowDescription] = useState<boolean>(false);
  const showDescriptionIconRef = useRef<HTMLElement>(null);
  const descriptionPRef = useRef<HTMLParagraphElement>(null);
  const groupActivitiesMenuRef = useRef<HTMLDivElement>(null);
  const postsBtnRef = useRef<HTMLButtonElement>(null);
  const membersBtnRef = useRef<HTMLButtonElement>(null);
  const pendingUsersBtnRef = useRef<HTMLButtonElement>(null);
  const pendingUsersNotificationRef = useRef<HTMLElement>(null);
  const editOptionsRef = useRef<HTMLDivElement>(null);
  const [showEditOptions, setShowEditOptions] = useState<boolean>(false);
  const [imageChanged, setImageChanged] = useState<boolean>(false);
  const [newImage, setNewImage] = useState<File | null>();
  const [changesMade, setChangesMade] = useState<boolean>(false);
  const [newDescription, setNewDescription] = useState<string>("");
  const [descriptionChangeError, setDescriptionChangeError] =
    useState<string>("");
  const [newName, setNewName] = useState<string>("");
  const [nameChangeError, setNameChangeError] = useState<string>("");
  const [privacyChanged, setPrivacyChanged] = useState<boolean>(false);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [activeUserIsMember, setActiveUserIsMember] = useState<boolean>(false);
  const [activeUserIsAdmin, setActiveUserIsAdmin] = useState<boolean>(false);
  const [activeUserIsPending, setActiveUserIsPending] = useState<boolean>();
  const [selectedActivity, setSelectedActivity] = useState<JSX.Element | null>(
    null
  );
  const [activityKey, setActivityKey] = useState(0);

  const { user, login, logout } = useContext(AuthContext);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroup = async () => {
      const groupData = await GroupsService.getGroupById(idNum);
      setGroup(groupData);
    };

    fetchGroup();
  }, []);

  useEffect(() => {
    if (group) {
      const fetchGroupImage = async () => {
        const image = await FileService.getFile(group.image);
        setGroupImage(image);
      };

      fetchGroupImage();
      if (user) {
        setActiveUser(user);
      }
    }
  }, [group]);

  useEffect(() => {
    if (group?.groupMembersIds.some((id) => id === activeUser?.id)) {
      setActiveUserIsMember(true);
    }
    if (group?.groupAdminsIds.some((id) => id === activeUser?.id)) {
      setActiveUserIsAdmin(true);
    }
    if (group?.pendingMembersIds.some((id) => id === activeUser?.id)) {
      setActiveUserIsPending(true);
    }
  }, [activeUser]);

  useEffect(() => {
    const fetchData = async () => {
      const activity = await groupPosts();
      setSelectedActivity(activity);
      updateActiveClass("posts");
    };
    fetchData();
  }, [group, activeUserIsMember]);

  function timeSince(date: Date) {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30.44); // Approximate number of days in a month
    const years = Math.floor(days / 365.25); // Account for leap years

    if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else if (days < 7) {
      return `${days} days ago`;
    } else if (weeks < 4) {
      return `${weeks} weeks ago`;
    } else if (months < 12) {
      return `${months} months ago`;
    } else {
      return `${years} years ago`;
    }
  }

  const nothingToShow = (message: string) => {
    return (
      <div className={styles.nothingToShow}>
        <h3>{message}</h3>
      </div>
    );
  };

  const groupPosts = async () => {
    if (group?.private && !activeUserIsMember) {
      return nothingToShow(
        "Posts in a private group are only visible to members"
      );
    } else if (group?.groupPosts.length === 0) {
      return nothingToShow("No posts to show");
    } else {
      let groupPosts: Post[] = [...group!.groupPosts];

      const sortedPosts = groupPosts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
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

  const groupMembers = async () => {
    const groupMembers: User[] = [];
    for (let i = 0; i < group!.groupMembersIds.length; i++) {
      const groupMember = await UserService.getUserById(
        group!.groupMembersIds[i]
      );
      groupMembers.push(groupMember);
    }
    for (let i = 0; i < groupMembers.length; i++) {
      if (groupMembers[i].id === activeUser?.id) {
        groupMembers.splice(i, 1);
      }
    }

    for (let i = 0; i < groupMembers.length; i++) {
      if (group?.groupAdminsIds.includes(groupMembers[i].id)) {
        const admin = groupMembers.splice(i, 1);
        groupMembers.unshift(admin[0]);
      }
    }

    const userIsAdmin = (userId: number) => {
      if (group?.groupAdminsIds.some((id) => id === userId)) {
        return "Admin";
      } else {
        return "Member";
      }
    };

    const thisUser = activeUser!;

    const promoteUser = async (userId: number) => {
      try {
        await GroupsService.promoteUserToGroupAdmin(group!.id, userId);
        await UserService.refreshLoggedInUser(login, logout);
        await Dialogues.success("User promoted successfully");
        window.location.reload();
      } catch (error: any) {
        try {
          const errorData = JSON.parse(error.message);
          Dialogues.error(errorData.message);
        } catch (parseError) {
          Dialogues.error();
        }
      }
    };

    const removeUser = async (userId: number) => {
      const confirmation = await Dialogues.showConfirmationAlert(
        "Remove user?"
      );
      if (!confirmation) return;
      try {
        await GroupsService.addOrRemoveUserFromGroup(group!.id, userId);
        await UserService.refreshLoggedInUser(login, logout);
        await Dialogues.success("User removed successfully");
        window.location.reload();
      } catch (error: any) {
        try {
          const errorData = JSON.parse(error.message);
          Dialogues.error(errorData.message);
        } catch (parseError) {
          Dialogues.error();
        }
      }
    };

    return (
      <CardsDisplay>
        {activeUserIsMember && (
          <Card
            key={thisUser.id}
            id={thisUser.id}
            image={thisUser.profilePicture}
            name={`${thisUser.firstName} ${thisUser.lastName}`}
            additionalDetail={`(active user)${userIsAdmin(thisUser.id)}`}
            objectType="user"
            objectTypeUrl="users"
          />
        )}
        {groupMembers.map((user) => (
          <Card
            key={user.id}
            id={user.id}
            image={user.profilePicture}
            name={`${user.firstName} ${user.lastName}`}
            additionalDetail={userIsAdmin(user.id)}
            objectType="user"
            objectTypeUrl="users"
            buttons={
              <div className={styles.cardBtns}>
                {activeUserIsAdmin && (
                  <>
                    {userIsAdmin(user.id) === "Member" && (
                      <button onClick={() => promoteUser(user.id)}>
                        <i className="bi bi-person-fill-up"></i>
                      </button>
                    )}
                    <button onClick={() => removeUser(user.id)}>
                      <i className="bi bi-person-fill-slash"></i>
                    </button>
                  </>
                )}
              </div>
            }
          />
        ))}
      </CardsDisplay>
    );
  };

  const pendingUsers = async () => {
    const pendingUsers: User[] = [];
    for (let i = 0; i < group!.pendingMembersIds.length; i++) {
      const pendingUser = await UserService.getUserById(
        group!.pendingMembersIds[i]
      );
      pendingUsers.push(pendingUser);
    }

    if (pendingUsers.length === 0) {
      return nothingToShow("No users pending membership approval");
    } else {
      const approveUser = async (userId: number) => {
        try {
          await GroupsService.approveGroupJoinRequest(group!.id, userId);
          await UserService.refreshLoggedInUser(login, logout);
          await Dialogues.success("User approved successfully");
          window.location.reload();
        } catch (error: any) {
          try {
            const errorData = JSON.parse(error.message);
            Dialogues.error(errorData.message);
          } catch (parseError) {
            Dialogues.error();
          }
        }
      };

      const rejectUser = async (userId: number) => {
        try {
          await GroupsService.rejectGroupJoinRequest(group!.id, userId);
          await UserService.refreshLoggedInUser(login, logout);
          await Dialogues.success("User rejected successfully");
          window.location.reload();
        } catch (error: any) {
          try {
            const errorData = JSON.parse(error.message);
            Dialogues.error(errorData.message);
          } catch (parseError) {
            Dialogues.error();
          }
        }
      };

      return (
        <CardsDisplay>
          {pendingUsers.map((user) => (
            <Card
              key={user.id}
              id={user.id}
              image={user.profilePicture}
              name={`${user.firstName} ${user.lastName}`}
              additionalDetail="Pending"
              objectType="user"
              objectTypeUrl="users"
              buttons={
                <div className={styles.cardBtns}>
                  <button onClick={() => approveUser(user.id)}>
                    <i className="bi bi-check2"></i>
                  </button>
                  <button onClick={() => rejectUser(user.id)}>
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              }
            />
          ))}
        </CardsDisplay>
      );
    }
  };

  const toggleDescription = () => {
    setShowDescription(!showDescription);
  };

  useEffect(() => {
    if (showDescription) {
      descriptionPRef.current?.classList.add(`${styles.showDescription}`);
      showDescriptionIconRef.current?.classList.remove(
        `${styles.rotateIconBack}`
      );
      showDescriptionIconRef.current?.classList.add(`${styles.rotateIcon}`);
    } else {
      descriptionPRef.current?.classList.remove(`${styles.showDescription}`);
      showDescriptionIconRef.current?.classList.remove(`${styles.rotateIcon}`);
      showDescriptionIconRef.current?.classList.add(`${styles.rotateIconBack}`);
    }
  }, [showDescription]);

  const updateActiveClass = (activity: string) => {
    postsBtnRef.current?.classList.toggle(styles.active, activity === "posts");
    membersBtnRef.current?.classList.toggle(
      styles.active,
      activity === "members"
    );
    pendingUsersBtnRef.current?.classList.toggle(
      styles.active,
      activity === "pendingUsers"
    );
  };

  const handleSelectActivity = async (activity: string) => {
    let component: JSX.Element | null = null;
    if (activity === "members") {
      component = await groupMembers();
    } else if (activity === "pendingUsers") {
      component = await pendingUsers();
      if (pendingUsersNotificationRef.current) {
        pendingUsersNotificationRef.current.style.display = "none";
      }
    } else {
      component = await groupPosts();
    }
    setSelectedActivity(component);
    setActivityKey((prevKey) => prevKey + 1);
    updateActiveClass(activity);
  };

  const enablePendingGroups = () => {
    return (
      <button
        className={styles.selectActivity}
        ref={pendingUsersBtnRef}
        onClick={() => handleSelectActivity("pendingUsers")}
      >
        Pending Users
        {group!.pendingMembersIds.length > 0 && (
          <i
            className={`bi bi-circle-fill ${styles.pendingUsersNotification}`}
            ref={pendingUsersNotificationRef}
          ></i>
        )}
      </button>
    );
  };

  const handleExitGroup = async () => {
    const confirmation = await Dialogues.showConfirmationAlert(
      "Are you sure you want to exit this group?"
    );
    if (confirmation) {
      const updatedGroup = await UserService.exitGroup(group!.id);
      setGroup(updatedGroup);
      Dialogues.success("You have exited the group");
    }
  };

  const handleImageChange = () => {
    const maxPictureSize = 10 * 1024 * 1024; // 10 MB
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.size < maxPictureSize) {
          setNewImage(file);
          setImageChanged(true);
          setChangesMade(true);
          setGroupImage(URL.createObjectURL(file));
        } else {
          Dialogues.error("File size should be less than 10MB");
        }
        input.remove();
      }
    };
    input.onblur = () => {
      input.remove();
    };
    editOptionsRef.current?.appendChild(input);
    input.click();
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    if (e.target.value !== group?.description) {
      if (e.target.value === "") {
        setDescriptionChangeError("Description is required");
      } else if (e.target.value.length > 512) {
        setDescriptionChangeError("Description must not exceed 512 characters");
      } else {
        setDescriptionChangeError("");
        setNewDescription(e.target.value);
      }
      setChangesMade(true);
    } else {
      setDescriptionChangeError("");
    }
  };

  const handleNameChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value !== group?.name) {
      if (e.target.value.length < 2) {
        setNameChangeError("Group name must be at least 2 characters");
      } else if (e.target.value.length > 32) {
        setNameChangeError("Group name must not exceed 32 characters");
      } else {
        setNameChangeError("");
        setNewName(e.target.value);
      }
      setChangesMade(true);
    } else {
      setNameChangeError("");
    }
  };

  const handlePrivacyChange = () => {
    setPrivacyChanged(!privacyChanged);
  };

  const startOrDiscardEdit = () => {
    setShowEditOptions(!showEditOptions);
    if (showEditOptions) {
      setNewImage(null);
      setNewDescription("");
      setNewName("");
      setImageChanged(false);
      setPrivacyChanged(false);
      setChangesMade(false);
      setGroupImage(group!.image);
    }
  };

  const handleSaveChanges = async () => {
    const newValues: UpdateGroup = {
      name: newName || null,
      description: newDescription || null,
      image: newImage || null,
      private: group!.private,
    };

    if (privacyChanged) {
      newValues.private = !group!.private;
    }

    const { image, ...groupData } = newValues;
    const formData = new FormData();
    formData.append(
      "updateDetails",
      new Blob([JSON.stringify(groupData)], { type: "application/json" })
    );
    if (image) {
      formData.append("imageFile", image);
    }
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });
    try {
      await GroupsService.updateGroupById(group!.id, formData);
      await UserService.refreshLoggedInUser(login, logout);
      await Dialogues.success("Group updated successfully");
      window.location.reload();
    } catch (error: any) {
      try {
        const errorData = JSON.parse(error.message);
        Dialogues.error(errorData.message);
      } catch (parseError) {
        Dialogues.error();
      }
    }
  };

  const handleDeleteGroup = async () => {
    const confirmation = await Dialogues.showConfirmationAlert(
      "Are you sure you want to delete this group? This action cannot be undone."
    );
    if (confirmation) {
      try {
        await GroupsService.deleteGroupById(group!.id);
        await UserService.refreshLoggedInUser(login, logout);
        Dialogues.success("Group deleted successfully");
        navigate("/");
      } catch (error: any) {
        try {
          const errorData = JSON.parse(error.message);
          Dialogues.error(errorData.message);
        } catch (parseError) {
          Dialogues.error();
        }
      }
    }
  };

  const sendJoinRequest = async () => {
    try {
      await UserService.sendRequestToJoinGroup(group!.id);
      await UserService.refreshLoggedInUser(login, logout);
      Dialogues.success("Request to join group sent successfully");
      window.location.reload();
    } catch (error: any) {
      try {
        const errorData = JSON.parse(error.message);
        Dialogues.error(errorData.message);
      } catch (parseError) {
        Dialogues.error();
      }
    }
  };

  return (
    <>
      <div className={styles.groupImageContainer}>
        <img
          className={styles.groupImage}
          src={groupImage ?? ""}
          alt="Group Image"
        />
      </div>
      <div className={styles.groupDetails}>
        <h3>{group?.name}</h3>
        <div className={styles.groupInfo}>
          <p className={styles.createdAt}>{`Created ${
            group?.createdAt ? timeSince(new Date(group?.createdAt)) : "Unknown"
          }`}</p>
          <p className={styles.groupPrivate}>
            {group?.private ? (
              <>
                {`Private group `}
                <i className="bi bi-shield-lock"></i>
              </>
            ) : (
              "Public group"
            )}
          </p>
        </div>
      </div>
      <div className={styles.descriptionContainer}>
        <button className={styles.descriptionBtn} onClick={toggleDescription}>
          {showDescription ? "Hide description" : "Show description"}
          <i
            className="bi bi-chevron-down rotate-0"
            ref={showDescriptionIconRef}
          ></i>
        </button>
        <p className={styles.description} ref={descriptionPRef}>
          {group?.description}
        </p>
      </div>
      {activeUserIsMember && (
        <div className={styles.groupControls}>
          <button
            className={styles.createPostInGroupBtn}
            onClick={() => navigate(`/groups/${group?.id}/create-post`)}
          >
            Create Post <i className="bi bi-plus-lg"></i>
          </button>
          {activeUserIsAdmin && (
            <button
              className={styles.editGroupBtn}
              onClick={startOrDiscardEdit}
            >
              {!showEditOptions ? (
                <>
                  Edit Group <i className="bi bi-pen"></i>
                </>
              ) : (
                <>
                  Discard Changes <i className="bi bi-x-lg"></i>
                </>
              )}
            </button>
          )}
          <button className={styles.leaveGroupBtn} onClick={handleExitGroup}>
            Leave Group <i className="bi bi-box-arrow-right"></i>
          </button>
          {activeUser?.roles.some((role) => role.name === "ROLE_ADMIN") && (
            <button
              className={styles.deleteGroupBtn}
              onClick={handleDeleteGroup}
            >
              Delete Group <i className="bi bi-trash"></i>
            </button>
          )}
        </div>
      )}
      {!activeUserIsMember && !activeUserIsPending && (
        <div className={styles.groupControls}>
          <button className={styles.editGroupBtn} onClick={sendJoinRequest}>
            Join Group <i className="bi bi-plus-lg"></i>
          </button>
        </div>
      )}

      {!activeUserIsMember && activeUserIsPending && (
        <div className={styles.groupControls}>
          <button className={styles.editGroupBtn} disabled>
            Request Pending <i className="bi bi-clock"></i>
          </button>
        </div>
      )}
      {showEditOptions && activeUserIsAdmin && (
        <div className={styles.editOptions} ref={editOptionsRef}>
          {(changesMade || imageChanged || privacyChanged) &&
            !nameChangeError &&
            !descriptionChangeError && (
              <button
                className={styles.saveChangesBtn}
                onClick={handleSaveChanges}
              >
                Save Changes <i className="bi bi-floppy"></i>
              </button>
            )}
          <button className={styles.editGroupBtn} onClick={handleImageChange}>
            Change group image <i className="bi bi-pen"></i>
          </button>
          <input
            type="text"
            onChange={handleNameChanged}
            defaultValue={group?.name}
            placeholder="Group name"
          />
          {nameChangeError && (
            <p className={styles.errorP}>{nameChangeError}</p>
          )}
          <textarea
            className={styles.editDescription}
            placeholder="Group description"
            defaultValue={group?.description}
            onChange={handleDescriptionChange}
          />
          {descriptionChangeError && (
            <p className={styles.errorP}>{descriptionChangeError}</p>
          )}
          <div className={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="privacyCheckbox"
              onChange={handlePrivacyChange}
            />
            <label htmlFor="privacyCheckbox">
              {group?.private ? (
                <>Make group public</>
              ) : (
                <>
                  Make group private <i className="bi bi-shield-lock"></i>
                </>
              )}
            </label>
          </div>
        </div>
      )}
      <div className={styles.groupActivitiesMenu} ref={groupActivitiesMenuRef}>
        <button
          className={`${styles.selectActivity} ${styles.active}`}
          ref={postsBtnRef}
          onClick={() => handleSelectActivity("posts")}
        >
          Posts
        </button>
        <button
          className={styles.selectActivity}
          ref={membersBtnRef}
          onClick={() => handleSelectActivity("members")}
        >
          Group Members
        </button>
        {group?.private && activeUserIsAdmin && enablePendingGroups()}
      </div>
      <div className={styles.selectedActivity} key={activityKey}>
        {selectedActivity}
      </div>
    </>
  );
};

export default GroupDetails;
