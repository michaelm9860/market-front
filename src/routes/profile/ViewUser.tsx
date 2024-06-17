import { useEffect, useState } from "react";
import { User } from "../../@types/User";
import styles from "./Profile.module.scss";
import ProfileActivities from "./ProfileActivities";
import { useNavigate, useParams } from "react-router-dom";
import { Dialogues } from "../../ui/Dialogues";
import { UserService } from "../../services/user-service";
import { FileService } from "../../services/file-service";

const ViewUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const activeUser: User = JSON.parse(localStorage.getItem("user") ?? "");
  const [userProfilePicture, setUserProfilePicture] = useState<string>("");
  const navigate = useNavigate();

  const { id } = useParams();

  const idNum = parseInt(id ?? "");

  if (isNaN(idNum)) {
    throw new Error("User id must be a number!");
  } else if (activeUser.id === idNum) {
    navigate("/profile");
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await UserService.getUserById(idNum);
        setUser(user);
      } catch (error: any) {
        try {
          const errorData = JSON.parse(error.message);
          throw new Error(errorData.message);
        } catch (parseError) {
          throw new Error("Error fetching user data");
        }
      }
    };

    getUser();
  }, []);

  useEffect(() => {
    const getUserProfilePicture = async () => {
      if (user) {
        try {
          const res = await FileService.getFile(user.profilePicture);
          setUserProfilePicture(res);
        } catch (e) {
          console.error(e);
        }
      }
    };
    getUserProfilePicture();
  }, [user]);

  const handleDeleteAccount = async () => {
    if (user) {
      const confirmation = await Dialogues.showConfirmationAlert(
        "Are you sure you want to delete this account? This action cannot be undone."
      );
      if (confirmation) {
        try {
          await UserService.deleteUserById(user.id);
          await Dialogues.success("Account deleted successfully");
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
    } else {
      Dialogues.error("You do not have permission to delete this account");
    }
  };

  return (
    <>
      <div className={styles.profileDetails}>
        <div className={styles.profilePictureContainer}>
          <img
            className={styles.profilePicture}
            src={userProfilePicture}
            alt="User profile picture"
          />
        </div>
        <div className={styles.userInfo}>
          <h3
            className={styles.userName}
          >{`${user?.firstName} ${user?.lastName}`}</h3>
          <p>Location: {user?.location}</p>
        </div>
        <div className={styles.userContact}>
          <p>Email: {user?.email}</p>
          <p>Phone number: {user?.phoneNumber}</p>
        </div>
        <div className={styles.profileControls}>
          {activeUser &&
            activeUser.roles.some((role) => role.name === "ROLE_ADMIN") && (
              <p
                className={styles.deleteAccountBtn}
                onClick={handleDeleteAccount}
              >
                Delete Account
              </p>
            )}
        </div>
      </div>
      {user && <ProfileActivities user={user} />}
    </>
  );
};

export default ViewUser;
