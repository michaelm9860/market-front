import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../../@types/User";
import { UserUpdate } from "../../@types/UserUpdate";
import { AuthContext } from "../../contexts/AuthContext";
import { FileService } from "../../services/file-service";
import styles from "./Profile.module.scss";
import { UserService } from "../../services/user-service";
import { Dialogues } from "../../ui/Dialogues";
import ProfileActivities from "./ProfileActivities";

type ValidationErrors = {
  fileSizeError: string | null;
  locationLengthError: string | null;
  firstNameLengthError: string | null;
  lastNameLengthError: string | null;
  nameFormatError: string | null;
};

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfilePicture, setUserProfilePicture] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userLocation, setUserLocation] = useState<string>("");
  const { logout, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [updateValues, setUpdateValues] = useState<UserUpdate>({
    firstName: null,
    lastName: null,
    location: null,
    profilePictureFile: null,
  });
  const [currentValues, setCurrentValues] = useState<UserUpdate>();
  const [addFileInput, setAddFileInput] = useState<boolean>(false);
  const [addNameInput, setAddNameInput] = useState<boolean>(false);
  const [addLocationInput, setAddLocationInput] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    fileSizeError: null,
    locationLengthError: null,
    firstNameLengthError: null,
    lastNameLengthError: null,
    nameFormatError: null,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const locationInputRef = useRef<HTMLInputElement | null>(null);

  const [errorsDisplayed, setErrorsDisplayed] = useState<boolean>(false);
  const errorsDivRef = useRef<HTMLDivElement | null>(null);
  const profileControlsRef = useRef<HTMLDivElement | null>(null);

  const handleUpdateName = () => {
    setAddNameInput(!addNameInput);
    if (addNameInput) {
      const fullName = nameInputRef.current!.value.trim();
      const [firstName, ...lastNameParts] = fullName.split(" ");
      const lastName = lastNameParts.join(" ");

      setUserName(fullName);

      setUpdateValues((prevValues) => ({
        ...prevValues,
        firstName: firstName,
        lastName: lastName,
      }));

      if (fullName.includes(" ")) {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          nameFormatError: null,
        }));
      } else {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          nameFormatError:
            "first name and last name must be separated by a space",
        }));
      }
      if (firstName.length >= 2 && firstName.length <= 24) {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          firstNameLengthError: null,
        }));
      } else {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          firstNameLengthError:
            "First name must be between 2 and 24 characters",
        }));
      }
      if (lastName.length >= 2 && lastName.length <= 24) {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          lastNameLengthError: null,
        }));
      } else {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          lastNameLengthError: "Last name must be between 2 and 24 characters",
        }));
      }
    }
  };
  useEffect(() => {
    if (addNameInput && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [addNameInput]);

  const handleUpdateLocation = () => {
    setAddLocationInput(!addLocationInput);
    if (addLocationInput) {
      const location = locationInputRef.current!.value.trim();
      setUserLocation(location);
      setUpdateValues((prevValues) => ({
        ...prevValues,
        location: locationInputRef.current!.value.trim(),
      }));
      if (location.length >= 2 && location.length <= 32) {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          locationLengthError: null,
        }));
      } else {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          locationLengthError: "Location must be between 2 and 32 characters",
        }));
      }
    }
  };

  useEffect(() => {
    if (addLocationInput && locationInputRef.current) {
      locationInputRef.current.focus();
    }
  }, [addLocationInput]);

  const handleUpdatePfp = () => {
    setAddFileInput(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserProfilePicture(e.target?.result as string);
        setUpdateValues((prevValues) => ({
          ...prevValues,
          profilePictureFile: file,
        }));
        setAddFileInput(false);
      };
      reader.readAsDataURL(file[0]);
      if (file[0].size >= 10 * 1024 * 1024) {
        // 10MB
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          fileSizeError: "File size should be less than 10MB",
        }));
      } else {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          fileSizeError: null,
        }));
      }
    }
  };
  useEffect(() => {
    if (addFileInput && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [addFileInput]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setCurrentValues({
        firstName: parsedUser.firstName || null,
        lastName: parsedUser.lastName || null,
        location: parsedUser.location || null,
        profilePictureFile: null,
      });
      setUserName(`${parsedUser.firstName} ${parsedUser.lastName}`);
      setUserLocation(parsedUser.location);
    } else {
      navigate("/login");
    }
  }, []);

  const getUserProfilePicture = async () => {
    try {
      if (user?.profilePicture) {
        const res = await FileService.getFile(user.profilePicture);
        setUserProfilePicture(res);
      }
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    if (user) {
      getUserProfilePicture();
      setUserName(`${user?.firstName} ${user?.lastName}`);
      setUserLocation(user?.location);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const editsMade = () => {
    return (
      (updateValues.firstName &&
        updateValues.firstName.trim() !== currentValues?.firstName) ||
      updateValues.firstName?.length === 0 ||
      (updateValues.lastName &&
        updateValues.lastName.trim() !== currentValues?.lastName) ||
      updateValues.lastName?.length === 0 ||
      (updateValues.location &&
        updateValues.location.trim() !== currentValues?.location) ||
      updateValues.location?.length === 0 ||
      updateValues.profilePictureFile
    );
  };

  const noValidationErrors = () => {
    return (
      !validationErrors.fileSizeError &&
      !validationErrors.locationLengthError &&
      !validationErrors.firstNameLengthError &&
      !validationErrors.lastNameLengthError &&
      !validationErrors.nameFormatError
    );
  };

  const renderValidationErrors = () => {
    return Object.entries(validationErrors).map(([key, value]) => {
      if (value) {
        return (
          <p key={key} className={styles.errorP}>
            {value}
          </p>
        );
      }
      return null;
    });
  };

  const showValidationErrors = () => {
    setErrorsDisplayed(!errorsDisplayed);
  };

  useEffect(() => {
    let closeErrorsDivOnOutsideClick = (event: MouseEvent) => {
      if (
        errorsDivRef.current &&
        profileControlsRef.current &&
        !profileControlsRef.current.contains(event.target as Node)
      ) {
        setErrorsDisplayed(false);
      }
    };
    if (errorsDisplayed) {
      document.addEventListener("mousedown", closeErrorsDivOnOutsideClick);
      document.body.classList.add(styles.validationErrorsShown);
    } else {
      document.removeEventListener("mousedown", closeErrorsDivOnOutsideClick);
      document.body.classList.remove(styles.validationErrorsShown);
    }

    return () => {
      document.removeEventListener("mousedown", closeErrorsDivOnOutsideClick);
    };
  }, [errorsDisplayed]);

  const discardChanges = () => {
    setUpdateValues({
      firstName: null,
      lastName: null,
      location: null,
      profilePictureFile: null,
    });
    setValidationErrors({
      fileSizeError: null,
      locationLengthError: null,
      firstNameLengthError: null,
      lastNameLengthError: null,
      nameFormatError: null,
    });
    getUserProfilePicture();
    setUserName(`${user?.firstName} ${user?.lastName}`);
    setUserLocation(user?.location || "");
  };

  const handleSaveChanges = async () => {
    if (noValidationErrors()) {
      const data = updateValues;
      const formData = new FormData();
      formData.append(
        "updateDetails",
        new Blob([JSON.stringify(data)], { type: "application/json" })
      );

      if (data.profilePictureFile) {
        formData.append("profilePictureFile", data.profilePictureFile[0]);
      }

      try {
        await UserService.updateUser(formData);
        await Dialogues.success("User details updated successfully");
        await UserService.refreshLoggedInUser(login, logout)
      } catch (error: any) {
        try {
          const errorData = JSON.parse(error.message);
          Dialogues.error(errorData.message);
        } catch (parseError) {
          Dialogues.error();
        }
      } finally {
        window.location.reload();
      }
    } else {
      Dialogues.error(
        "Changes to user cannot be saved with validation errors present"
      );
      showValidationErrors();
    }
  };

  const handleDeleteAccount = async () => {
    if (user) {
      const confirmation = await Dialogues.showConfirmationAlert(
        "Are you sure you want to delete your account? This action cannot be undone."
      );
      if (confirmation) {
        try {
          await UserService.deleteUserById(user.id);
          await Dialogues.success("Account deleted successfully");
          logout();
        } catch (error: any) {
          try {
            const errorData = JSON.parse(error.message);
            Dialogues.error(errorData.message);
          } catch (parseError) {
            Dialogues.error();
          }
        }
      }
    }else{
      Dialogues.error("Must be logged in to delete account");
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
          <button className={styles.editBtn} onClick={handleUpdatePfp}>
            <i className="bi bi-pen"></i>
          </button>
          {addFileInput && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className={styles.editPfpInput}
              onChange={handleFileChange}
            />
          )}
        </div>
        <div className={styles.userInfo}>
          <h3 className={styles.userName}>
            {!addNameInput ? (
              <>
                {userName}
                <button className={styles.editBtn} onClick={handleUpdateName}>
                  <i className="bi bi-pen"></i>
                </button>
              </>
            ) : (
              <>
                <input
                  ref={nameInputRef}
                  type="text"
                  placeholder="First Name + Last Name"
                  defaultValue={userName}
                  onBlur={handleUpdateName}
                />
                <button className={styles.editBtn} onClick={handleUpdateName}>
                  <i className="bi bi-check2"></i>
                </button>
              </>
            )}
          </h3>
          <p>
            Location:
            {!addLocationInput ? (
              <>
                {userLocation}
                <button
                  className={styles.editBtn}
                  onClick={handleUpdateLocation}
                >
                  <i className="bi bi-pen"></i>
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  ref={locationInputRef}
                  defaultValue={userLocation}
                  onBlur={handleUpdateLocation}
                />
                <button
                  className={styles.editBtn}
                  onClick={handleUpdateLocation}
                >
                  <i className="bi bi-check2"></i>
                </button>
              </>
            )}
          </p>
        </div>
        <div className={styles.userContact}>
          <p>Email: {user?.email}</p>
          <p>Phone number: {user?.phoneNumber}</p>
        </div>
        <div className={styles.profileControls} ref={profileControlsRef}>
          {!noValidationErrors() && (
            <>
              <p className={styles.showErrorsBtn}>
                Invalid changes detected
                <button onClick={showValidationErrors}>
                  <i className="bi bi-info-circle"></i>
                </button>
              </p>
              {errorsDisplayed && (
                <div
                  className={styles.validationErrorsContainer}
                  ref={errorsDivRef}
                >
                  {renderValidationErrors()}
                </div>
              )}
            </>
          )}
          {editsMade() && (
            <>
              {noValidationErrors() && (
                <button
                  className={styles.handleEditBtn}
                  onClick={handleSaveChanges}
                >
                  <i className="bi bi-floppy"></i> Save Changes
                </button>
              )}
              <button className={styles.handleEditBtn} onClick={discardChanges}>
                <i className="bi bi-trash3"></i> Discard Changes
              </button>
            </>
          )}
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i> Logout
          </button>
          <p className={styles.deleteAccountBtn} onClick={handleDeleteAccount}>
            Delete Account
          </p>
        </div>
      </div>
      <div className={styles.createBtnsContainer}>
        <button className={styles.createNew} onClick={() => navigate("/create-post")}>Create New Post <i className="bi bi-plus-lg"></i></button>
        <button className={styles.createNew} onClick={() => navigate("/create-group")}>Create New Group <i className="bi bi-plus-lg"></i> </button>
      </div>
      {user && <ProfileActivities user={user} />}
    </>
  );
};

export default Profile;
