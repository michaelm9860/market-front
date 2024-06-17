import { useContext, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import Select, { SingleValue } from "react-select";
import { CreatePost } from "../../@types/CreatePost";
import { Group } from "../../@types/Group";
import { AuthContext } from "../../contexts/AuthContext";
import { GroupsService } from "../../services/groups-service";
import { PostsService } from "../../services/posts-service";
import { UserService } from "../../services/user-service";
import { Dialogues } from "../../ui/Dialogues";
import styles from "./CreateNew.module.scss";

const CreateNewPost = () => {
  const maxPictureSize = 10 * 1024 * 1024; // 10 MB
  const { id } = useParams();

  const picturesContainerRef = useRef<HTMLDivElement>(null);
  const customCategoryRef = useRef<HTMLInputElement>(null);
  const customCurrencyRef = useRef<HTMLInputElement>(null);
  const [showCustomCurrency, setShowCustomCurrency] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [pictures, setPictures] = useState<File[]>([]);
  const [numberOfPictures, setNumberOfPictures] = useState(0);
  const [group, setGroup] = useState<Group | null>(null);
  const [groupError, setGroupError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { login, logout, user } = useContext(AuthContext);

  useEffect(() => {
    const checkGroup = async (idNum: number) => {
      let group: Group;
      try {
        group = await GroupsService.getGroupById(idNum);
      } catch (e) {
        setGroupError("Group not found");
        return;
      }
      if (!group.groupMembersIds.some((memberId) => memberId === user?.id)) {
        setGroupError(
          "You are not a member of this group. Only members can create posts in a group."
        );
      } else {
        setGroup(group);
      }
    };

    if (id !== undefined) {
      const idNum = parseInt(id);
      if (isNaN(idNum)) {
        throw new Error("Group id must be a number!");
      } else {
        checkGroup(idNum);
      }
    }
  }, [id, user]);

  const {
    control,
    register,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
    handleSubmit,
  } = useForm<CreatePost>({
    mode: "onChange",
  });

  type OptionType = { value: string; label: string };

  const currencyOptions: OptionType[] = [
    { value: "$", label: "$ - USD" },
    { value: "€", label: "€ - EUR" },
    { value: "JPY¥", label: "¥ - JPY" },
    { value: "£", label: "£ - GBP" },
    { value: "AUD", label: "A$ - AUD" },
    { value: "CAD", label: "C$ - CAD" },
    { value: "CHF", label: "CHF" },
    { value: "CNY¥", label: "¥ - CNY" },
    { value: "HKD", label: "HK$ - HKD" },
    { value: "NZD", label: "NZ$ - NZD" },
    { value: "₪", label: "₪ - ILS" },
    { value: "Other", label: "Other" },
  ];

  const categoryOptions: OptionType[] = [
    { value: "electronics", label: "Electronics" },
    { value: "clothing", label: "Clothing" },
    { value: "home_and_kitchen", label: "Home & Kitchen" },
    { value: "beauty_and_personal_care", label: "Beauty & Personal Care" },
    { value: "sports_and_outdoors", label: "Sports & Outdoors" },
    { value: "toys_and_games", label: "Toys & Games" },
    { value: "books", label: "Books" },
    { value: "cars", label: "Cars" },
    { value: "health_and_household", label: "Health & Household" },
    { value: "baby", label: "Baby" },
    { value: "grocery_and_gourmet_food", label: "Grocery & Gourmet Food" },
    { value: "office_products", label: "Office Products" },
    { value: "pet_supplies", label: "Pet Supplies" },
    { value: "arts_crafts_and_sewing", label: "Arts, Crafts & Sewing" },
    { value: "industrial_and_scientific", label: "Industrial & Scientific" },
    { value: "luggage_and_travel_gear", label: "Luggage & Travel Gear" },
    { value: "musical_instruments", label: "Musical Instruments" },
    { value: "video_games", label: "Video Games" },
    { value: "garden_and_outdoor", label: "Garden & Outdoor" },
    { value: "tools_and_home_improvement", label: "Tools & Home Improvement" },
    {
      value: "cell_phones_and_accessories",
      label: "Cell Phones & Accessories",
    },
    { value: "jewelry", label: "Jewelry" },
    { value: "watches", label: "Watches" },
    { value: "shoes", label: "Shoes" },
    { value: "handmade", label: "Handmade" },
    { value: "collectibles_and_fine_art", label: "Collectibles & Fine Art" },
    { value: "appliances", label: "Appliances" },
    { value: "real_estate", label: "Real Estate" },
    { value: "Other", label: "Other" },
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size >= maxPictureSize) {
        Dialogues.error("File size should be less than 10MB");
        return;
      }

      const src = URL.createObjectURL(file);

      const imgContainer = document.createElement("div");
      imgContainer.className = styles.imageContainer;
      const img = document.createElement("img");
      img.src = src;
      img.alt = "Picture for your post";
      imgContainer.appendChild(img);
      const button = document.createElement("button");
      button.type = "button";
      button.innerHTML = "<i class='bi bi-x-lg'></i>";
      button.onclick = () => {
        const container = picturesContainerRef.current;
        if (container) {
          container.removeChild(imgContainer);
        }

        const updatedPictures = pictures.filter((p) => p !== file);
        setPictures(updatedPictures);
        setNumberOfPictures(updatedPictures.length);
        setValue("pictures", updatedPictures);
        if (numberOfPictures === 0) {
          setError("pictures", { message: "At least one picture is required" });
        }
      };
      imgContainer.appendChild(button);

      const container = picturesContainerRef.current;
      if (container) {
        container.appendChild(imgContainer);
        const updatedPictures = [...pictures, file];
        setPictures(updatedPictures);
        setValue("pictures", updatedPictures);
        setNumberOfPictures(updatedPictures.length);
        clearErrors("pictures");
      }

      event.target.remove();
    } else {
      event.target.remove();
    }
  };

  const addPicture = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.className = styles.inputFile;
    input.onchange = (event) =>
      handleFileChange(event as unknown as React.ChangeEvent<HTMLInputElement>);

    const container = picturesContainerRef.current;
    if (container) {
      container.appendChild(input);
      input.click();
    }
  };

  const currencySelectStyles = {
    control: (base: any) => ({ ...base, border: "none" }),
  };

  const categorySelectStyles = {
    control: (base: any) => ({ ...base, border: "none" }),
    container: (base: any) => ({ ...base, minWidth: "20%" }),
  };

  const handleCustomCurrencyChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    if (value.length > 10) {
      setError("currency", {
        message: "Currency must not exceed 10 characters",
      });
    } else if (value.length === 0) {
      setError("currency", {
        message: "Currency must be at least 1 character",
      });
    } else {
      clearErrors("currency");
      setValue("currency", value);
    }
  };

  const handleCustomCategoryChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    if (value.length > 32) {
      setError("category", {
        message: "Category must not exceed 32 characters",
      });
    } else if (value.length === 0) {
      setError("category", {
        message: "Category must be at least 1 character",
      });
    } else {
      clearErrors("category");
      setValue("category", value);
    }
  };

  const handleCreatePost = async (data: CreatePost) => {
    if (numberOfPictures === 0) {
      setError("pictures", { message: "At least one picture is required" });
      return;
    }

    if (data.location === "") {
      data.location = null;
    }

    const formData = new FormData();
    const { pictures, ...postData } = data;
    formData.append(
      "productPost",
      new Blob([JSON.stringify(postData)], { type: "application/json" })
    );

    pictures.forEach((file) => {
      formData.append("picturesFiles", file);
    });

    if (group) {
      try {
        const newPost = await PostsService.createPostInGroup(
          group.id,
          formData
        );
        await Dialogues.success("Post created successfully in group");
        await UserService.refreshLoggedInUser(login, logout);
        navigate(`/posts/${newPost.id}`);
      } catch (error: any) {
        try {
          const errorData = JSON.parse(error.message);
          Dialogues.error(errorData.message);
        } catch (parseError) {
          Dialogues.error();
        }
      }
    } else {
      try {
        const newPost = await PostsService.createPost(formData);
        await Dialogues.success("Post created successfully");
        await UserService.refreshLoggedInUser(login, logout);
        navigate(`/posts/${newPost.id}`);
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

  if (groupError) {
    throw new Error(groupError);
  } else {
    return (
      <div className={styles.formContainer}>
        <h3>{group ? "Create New Post In Group" : "Create New Post"}</h3>
        <form
          noValidate
          className={styles.createForm}
          onSubmit={handleSubmit(handleCreatePost)}
        >
          <input
            {...register("productName", {
              required: "Product name is required",
              maxLength: {
                value: 32,
                message: "Product name must not exceed 32 characters",
              },
            })}
            type="text"
            placeholder="Name of Product"
          />
          {errors.productName && (
            <p className={styles.errorP}>{errors.productName.message}</p>
          )}
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
          <div className={styles.priceContainer}>
            <Controller
              name="currency"
              control={control}
              rules={{ required: "Currency is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={currencyOptions}
                  isSearchable
                  placeholder="Select a currency"
                  styles={currencySelectStyles}
                  value={
                    currencyOptions.find(
                      (option) => option.value === field.value
                    ) || null
                  }
                  onChange={(selectedOption) => {
                    const value = (selectedOption as SingleValue<OptionType>)
                      ?.value;
                    field.onChange(value);
                    if (value === "Other") {
                      setShowCustomCurrency(true);
                    } else {
                      setShowCustomCurrency(false);
                    }
                  }}
                  onBlur={field.onBlur}
                />
              )}
            />
            {showCustomCurrency && (
              <input
                ref={customCurrencyRef}
                type="text"
                placeholder="Enter currency"
                onChange={handleCustomCurrencyChange}
              />
            )}
            <input
              {...register("price", {
                required: "Price is required",
                valueAsNumber: true,
              })}
              type="number"
              placeholder="Price"
              className={styles.priceInput}
            />
          </div>
          {(errors.currency || errors.price) && (
            <p className={styles.errorP}>
              {errors.currency?.message}
              {errors.currency && errors.price && <br />}
              {errors.price?.message}
            </p>
          )}
          <div className={styles.categoryContainer}>
            <Controller
              name="category"
              control={control}
              rules={{ required: "Category is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={categoryOptions}
                  isSearchable
                  placeholder="Select a category"
                  styles={categorySelectStyles}
                  value={
                    categoryOptions.find(
                      (option) => option.value === field.value
                    ) || null
                  }
                  onChange={(selectedOption) => {
                    const value = (selectedOption as SingleValue<OptionType>)
                      ?.value;
                    field.onChange(value);
                    if (value === "Other") {
                      setShowCustomCategory(true);
                    } else {
                      setShowCustomCategory(false);
                    }
                  }}
                  onBlur={field.onBlur}
                />
              )}
            />
            {showCustomCategory && (
              <input
                ref={customCategoryRef}
                type="text"
                placeholder="Enter category"
                onChange={handleCustomCategoryChange}
              />
            )}
          </div>
          {errors.category && (
            <p className={styles.errorP}>{errors.category.message}</p>
          )}

          <input
            {...register("location", {
              validate: (value) =>
                value === null ||
                value.length === 0 ||
                (value.length >= 2 && value.length <= 32) ||
                "Location must be between 2 and 32 characters",
            })}
            type="text"
            placeholder="Location of the product (City, Country, etc.)"
          />
          <p className="text-sm">
            <i className="bi bi-info-circle"></i> You can leave the location
            field blank. If you do, the location will be set to your account's
            location.
          </p>
          {errors.location && (
            <p className={styles.errorP}>{errors.location.message}</p>
          )}
          <h4>Add pictures of your product:</h4>
          {errors.pictures && (
            <p className={styles.errorP}>{errors.pictures.message}</p>
          )}
          <div
            className={styles.pictureInputsContainer}
            ref={picturesContainerRef}
          >
            {numberOfPictures < 10 && (
              <button
                type="button"
                onClick={addPicture}
                className={styles.addPictureBtn}
              >
                <i className="bi bi-plus"></i>
              </button>
            )}
          </div>
          <button type="submit" className={styles.createPostBtn}>
            Create Post
          </button>
        </form>
      </div>
    );
  }
};

export default CreateNewPost;
