import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { CreateGroup } from "../../@types/CreateGroup";
import { AuthContext } from "../../contexts/AuthContext";
import { GroupsService } from "../../services/groups-service";
import { UserService } from "../../services/user-service";
import { Dialogues } from "../../ui/Dialogues";
import styles from "./CreateNew.module.scss";

const defaultGroupImage = "/public/assets/default_group_image.png";
const maxPictureSize = 10 * 1024 * 1024; // 10 MB

const CreateNewGroup = () => {

  const navigate = useNavigate();
  const { login, logout } = useContext(AuthContext);
  const [fileName, setFileName] = useState<string | null>(null);
  const {
    register,
    setError,
    clearErrors,
    resetField,
    formState: { errors },
    handleSubmit,
  } = useForm<CreateGroup>({
    mode: "onChange",
  });

  const removeFile = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setFileName(null);
    resetField("image");
  };

  const handleCreateGroup = async (data: CreateGroup) => {
    const formData = new FormData();
    const { image, ...groupData } = data;
    formData.append(
      "group",
      new Blob([JSON.stringify(groupData)], { type: "application/json" })
    );
    if (image && image[0]) {
      formData.append("imageFile", image[0]);
    } else {
      const defaultFile = await fetch(defaultGroupImage).then((res) =>
        res.blob()
      );
      formData.append("imageFile", defaultFile);
    }

    try {
      const group = await GroupsService.createGroup(formData);
      await Dialogues.success("Group created successfully.");
      await UserService.refreshLoggedInUser(login, logout);

      navigate(`/groups/${group.id}`);
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
    <div className={styles.formContainer}>
      <h3>Create New Group</h3>
      <form
        noValidate
        className={styles.createForm}
        onSubmit={handleSubmit(handleCreateGroup)}
      >
        <input
          {...register("name", {
            required: "Group name is required",
            maxLength: {
              value: 32,
              message: "Group name must not exceed 32 characters",
            },
          })}
          type="text"
          placeholder="Group Name"
        />
        {errors.name && <p className={styles.errorP}>{errors.name.message}</p>}
        <textarea
          {...register("description", {
            required: "Description is required",
            maxLength: {
              value: 512,
              message: "Description must not exceed 512 characters",
            },
          })}
          placeholder="Description"
        />
        {errors.description && (
          <p className={styles.errorP}>{errors.description.message}</p>
        )}
        <input
          type="file"
          accept="image/*"
          id="groupImageFile"
          className={styles.inputFile}
          {...register("image", {
            onChange: (e) => {
              const file = e.target.files?.[0];
              if (file && file.size >= maxPictureSize) {
                setError("image", {
                  type: "manual",
                  message: "File size should be less than 10MB",
                });
              } else {
                clearErrors("image");
              }
              if (file) {
                setFileName(file.name);
              } else {
                setFileName(null);
              }
            },
          })}
        />
        <label htmlFor="groupImageFile" className={styles.inputFileLabel}>
          {fileName ? (
            <>
              <span>{fileName}</span>
              <button
                type="button"
                onClick={removeFile}
                className={styles.removeFileBtn}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </>
          ) : (
            <>
              <span>Select group image (optional)</span>
              <i className="bi bi-cloud-arrow-up-fill"></i>
            </>
          )}
        </label>

        {errors.image && (
          <p className={styles.errorP}>{errors.image.message}</p>
        )}

        <div className={styles.checkboxContainer}>
          <input type="checkbox" id="isPrivate" {...register("isPrivate")} />
          <label htmlFor="isPrivate">Make group private</label>
        </div>
        <button type="submit" className={styles.createGroupBtn}>
          Create Group
        </button>
      </form>
    </div>
  );
};

export default CreateNewGroup;
