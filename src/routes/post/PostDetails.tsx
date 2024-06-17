import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Post } from "../../@types/Post";
import { UpdatePost } from "../../@types/UpdatePost";
import { User } from "../../@types/User";
import Carousel from "../../components/carousel/Carousel";
import { AuthContext } from "../../contexts/AuthContext";
import { FileService } from "../../services/file-service";
import { PostsService } from "../../services/posts-service";
import { UserService } from "../../services/user-service";
import { Dialogues } from "../../ui/Dialogues";
import styles from "./Post.module.scss";

const PostDetails = () => {
  const { id } = useParams();

  const idNum = parseInt(id ?? "");

  if (isNaN(idNum)) {
    throw new Error("Post id must be a number!");
  }

  const [saved, setSaved] = useState<boolean>(false);
  const [post, setPost] = useState<Post | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [creatorPfp, setCreatorPfp] = useState<string>("");
  const [imagesReady, setImagesReady] = useState<boolean>(false);
  const [showEditOptions, setShowEditOptions] = useState(false);
  const [descriptionEditError, setDescriptionEditError] = useState<string>("");
  const [priceEditError, setPriceEditError] = useState<string>("");
  const [locationEditError, setLocationEditError] = useState<string>("");
  const [pictureEditError, setPictureEditError] = useState<string>("");
  const [newPictures, setNewPictures] = useState<
    { url: string; file: File | null }[]
  >([]);
  const [pictureEditsMade, setPictureEditsMade] = useState<boolean>(false);
  const editPicturesContainerRef = useRef<HTMLDivElement>(null);

  const [showContactOptions, setShowContactOptions] = useState(false);
  const [contactOptionsText, setContactOptionsText] = useState(
    "Show Contact Options"
  );

  const { isLoggedIn, user, logout, login } = useContext(AuthContext);

  const navigate = useNavigate();

  useEffect(() => {
    const getPost = async () => {
      try {
        const post = await PostsService.getPostById(idNum);
        setPost(post);
      } catch (error: any) {
        try {
          const errorData = JSON.parse(error.message);
          throw new Error(errorData.message);
        } catch (parseError) {
          throw new Error("Error fetching post data");
        }
      }
    };

    getPost();
  }, []);

  const fetchImageAsBlob = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const filename = url.split("/").pop() || "";
    return new File([blob], filename, { type: blob.type });
  };

  const getImages = async () => {
    try {
      const imagesPromises = post!.pictures.map(async (picture) => {
        const url = await FileService.getFile(picture);
        const file = await fetchImageAsBlob(url);
        return { url, file };
      });
      const fetchedImages = await Promise.all(imagesPromises);
      setImages(fetchedImages.map(({ url }) => url));
      setNewPictures(fetchedImages);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  useEffect(() => {
    if (post) {
      getImages();
    }
    if (isLoggedIn) {
      if (user?.savedPostsIds.some((savedPostId) => savedPostId === post?.id)) {
        setSaved(true);
      }
    }
  }, [post]);

  useEffect(() => {
    if (images.length === post?.pictures.length) {
      setImagesReady(true);
      const newPicturesPromises = images.map(async (image) => {
        const file = await fetchImageAsBlob(image);
        return { url: image, file };
      });
      Promise.all(newPicturesPromises).then((newPictures) => {
        setNewPictures(newPictures);
      });
    }
  }, [images]);

  useEffect(() => {
    const getCreator = async () => {
      if (post) {
        try {
          const creator = await UserService.getUserById(post.userId);
          setCreator(creator);
        } catch (error: any) {
          try {
            const errorData = JSON.parse(error.message);
            throw new Error(errorData.message);
          } catch (parseError) {
            throw new Error("Error fetching creator user data");
          }
        }
      }
    };
    getCreator();
  }, [post]);

  useEffect(() => {
    const getCreatorPfp = async () => {
      if (creator) {
        const res = await FileService.getFile(creator.profilePicture);
        setCreatorPfp(res);
      }
    };
    getCreatorPfp();
  }, [creator]);

  const openWhatsApp = () => {
    const encodedMessage = encodeURIComponent(
      `Hi, I am interested in your product: ${post?.productName}\n` +
        `That you posted in ${window.location.href}\n` +
        `Is it still available?`
    );
    const whatsappUrl = `https://wa.me/${creator?.phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const copyPhoneNumber = async () => {
    try {
      await navigator.clipboard.writeText(creator?.phoneNumber ?? "");
    } catch (error) {
      alert("Failed to copy phone number to clipboard");
    }
  };

  const toggleConactOptions = () => {
    setShowContactOptions(!showContactOptions);
  };

  useEffect(() => {
    if (!showContactOptions) {
      setContactOptionsText("Show Contact Options");
    } else {
      setContactOptionsText("Hide Contact Options");
    }
  }, [showContactOptions]);

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

  const handleDeletePost = async () => {
    const confirmation = await Dialogues.showConfirmationAlert(
      "Are you sure you want to delete this post?"
    );
    if (confirmation) {
      if (post) {
        try {
          await PostsService.deletePostById(post.id);
          await Dialogues.success("Post deleted successfully");
          if (creator?.id === user?.id) {
            await UserService.refreshLoggedInUser(login, logout);
          }
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
    }
  };

  const [newValues, setNewValues] = useState<UpdatePost>({
    description: null,
    location: null,
    price: null,
    pictures: [],
  });

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    if (e.target.value !== post?.description) {
      if (e.target.value.length > 512) {
        setDescriptionEditError("Description must not exceed 512 characters");
        setNewValues({ ...newValues, description: null });
      } else if (e.target.value.length === 0) {
        setDescriptionEditError("Description is required");
        setNewValues({ ...newValues, description: null });
      } else {
        setNewValues({ ...newValues, description: e.target.value });
        setDescriptionEditError("");
      }
    } else {
      setNewValues({ ...newValues, description: null });
      setDescriptionEditError("");
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();

    if (value === "") {
      setPriceEditError("Price is required");
      setNewValues({ ...newValues, price: null });
      return;
    }

    const parsedValue = parseFloat(value);

    if (isNaN(parsedValue)) {
      setPriceEditError("Price must be a number");
      setNewValues({ ...newValues, price: null });
    } else if (parsedValue < 0) {
      setPriceEditError("Price must be a positive number or zero");
      setNewValues({ ...newValues, price: null });
    } else {
      setPriceEditError("");
      setNewValues({
        ...newValues,
        price: parsedValue !== post?.price ? parsedValue : null,
      });
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value !== post?.location) {
      if (e.target.value.length < 2) {
        setLocationEditError("Location must be at least 2 characters long");
        setNewValues({ ...newValues, location: null });
      } else if (e.target.value.length > 32) {
        setLocationEditError("Location must not exceed 32 characters");
        setNewValues({ ...newValues, location: null });
      } else {
        setNewValues({ ...newValues, location: e.target.value });
        setLocationEditError("");
      }
    } else {
      setNewValues({ ...newValues, location: null });
      setLocationEditError("");
    }
  };

  const handleAddPicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxFileSize) {
        Dialogues.error("File size must not exceed 10MB");
        return;
      } else {
        const url = URL.createObjectURL(file);
        setNewPictures([...newPictures, { url, file }]);
        setPictureEditsMade(true);
        if (newPictures.length > 10) {
          setPictureEditError("A maximum of 10 pictures is allowed");
        } else {
          setPictureEditError("");
        }
      }
    }
  };

  const addPicture = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = async (e) => {
      if (input.files) {
        handleAddPicture(e as unknown as React.ChangeEvent<HTMLInputElement>);
      }
      input.remove();
    };
    const container = editPicturesContainerRef.current;
    if (container) {
      container.appendChild(input);
      input.click();
    }
  };

  const removePicture = (index: number) => {
    const newPicturesArray = newPictures.filter((_, i) => i !== index);
    setNewPictures(newPicturesArray);
    setPictureEditsMade(true);
    if (newPictures.length === 0) {
      setPictureEditError("At least one picture is required");
    } else {
      setPictureEditError("");
    }
  };

  const setFirstPicture = (index: number) => {
    if (index !== 0) {
      const newPicturesArray = [...newPictures];
      const [first] = newPicturesArray.splice(index, 1);
      newPicturesArray.unshift(first);
      setNewPictures(newPicturesArray);
      setPictureEditsMade(true);
    }
  };

  const editPictureDisplay = (index: number, image: string) => (
    <div key={index} className={styles.editPicture}>
      <img src={image} alt="Product picture" />
      <button
        className={styles.removePictureBtn}
        onClick={() => removePicture(index)}
      >
        <i className="bi bi-x"></i>
      </button>
      <button
        className={styles.setFirstBtn}
        onClick={() => setFirstPicture(index)}
      >
        {index === 0 ? (
          <i className="bi bi-star-fill"></i>
        ) : (
          <i className="bi bi-star"></i>
        )}
      </button>
    </div>
  );

  const editsMade = () => {
    return (
      newValues.description ||
      newValues.location ||
      newValues.price ||
      pictureEditsMade
    );
  };

  const noErrors = () => {
    return (
      !descriptionEditError &&
      !priceEditError &&
      !locationEditError &&
      !pictureEditError
    );
  };

  const startOrDiscardEdit = () => {
    if (showEditOptions) {
      setShowEditOptions(false);
      setDescriptionEditError("");
      setPriceEditError("");
      setLocationEditError("");
      setPictureEditError("");
      setNewPictures(images.map((image) => ({ url: image, file: null })));
      setPictureEditsMade(false);
      newValues.description = null;
      newValues.location = null;
      newValues.price = null;
      newValues.pictures = [];
    } else {
      setShowEditOptions(true);
    }
  };

  const handleSaveChanges = async () => {
    const formData = new FormData();
    const { pictures, ...postData } = newValues;
    formData.append(
      "updateDetails",
      new Blob([JSON.stringify(postData)], { type: "application/json" })
    );

    console.log(newPictures);
    newPictures.forEach(({ file }) => {
      if (file) {
        formData.append("picturesFiles", file);
      }
    });

    try {
      await PostsService.updatePostById(post!.id, formData);
      await Dialogues.success("Post updated successfully");
      await UserService.refreshLoggedInUser(login, logout);
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

  const saveOrUnsave = async () => {
    try {
      await PostsService.saveOrUnsavePost(post!.id);
      await UserService.refreshLoggedInUser(login, logout);
      setSaved(!saved);
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
      <div className={styles.postDetails}>
        <h3 className={styles.postName}>{post?.productName}</h3>
        {post?.contentUpdatedAt && (
          <h4 className={styles.timeStamp}>{`Last update ${
            post?.contentUpdatedAt ? timeSince(new Date(post?.contentUpdatedAt)) : "Unknown"
          }`}</h4>
        )}
        <h4 className={styles.timeStamp}>{`Created ${
          post?.createdAt ? timeSince(new Date(post?.createdAt)) : "Unknown"
        }`}</h4>
        {post?.price !== post?.originalPrice && (
          <h4 className={styles.originalPrice}>{post?.originalPrice}</h4>
        )}
        <h4 className={styles.currentPrice}>
          <span className={styles.currency}>{post?.currency}</span>
          {post?.price}
        </h4>
      </div>
      <div className={styles.postSaves}>
        <p>This post has been saved by {post?.savedCount} users</p>
        {isLoggedIn && (
          <button onClick={saveOrUnsave}>
            {saved ? (
              <>
                <i className="bi bi-bookmark-check-fill"></i>
              </>
            ) : (
              <>
                <i className="bi bi-bookmark"></i>
              </>
            )}
          </button>
        )}
      </div>
      <div className={styles.carouselContainer}>
        {imagesReady && <Carousel images={images} />}
      </div>
      <div className={styles.additionalInfo}>
        <div className={styles.postInfo}>
          <p className={styles.postLocation}>Location: {post?.location}</p>
          <p className={styles.postDescription}>{post?.description}</p>
        </div>

        <div className={styles.userInfo}>
          <div className={styles.seller}>
            <p
              className={styles.userName}
            >{`${creator?.firstName} ${creator?.lastName}`}</p>
            {isLoggedIn ? (
              user?.id === creator?.id ? (
                <Link to={`/profile`}>
                  <img
                    src={creatorPfp}
                    alt="Seller profile picture"
                    className={styles.userPfp}
                  />
                </Link>
              ) : (
                <Link to={`/users/${post?.userId}`}>
                  <img
                    src={creatorPfp}
                    alt="Seller profile picture"
                    className={styles.userPfp}
                  />
                </Link>
              )
            ) : (
              <img
                src={creatorPfp}
                alt="Seller profile picture"
                className={styles.userPfp}
              />
            )}
          </div>
          <div className={styles.userContact}>
            {showContactOptions && (
              <div className={styles.contactOptions}>
                <button
                  onClick={openWhatsApp}
                  className={styles.openWhatsappBtn}
                >
                  <i className="bi bi-whatsapp"></i>
                  Message Seller on WhatsApp
                </button>
                <hr />
                <span>{creator?.phoneNumber}</span>
                <button onClick={copyPhoneNumber}>
                  Click to copy phone number
                </button>
              </div>
            )}
            <button
              onClick={toggleConactOptions}
              className={styles.showContactOptions}
            >
              {contactOptionsText}
            </button>
          </div>
        </div>
      </div>
      {showEditOptions && (
        <div className={styles.editOptions}>
          {newPictures.length > 0 &&
            newPictures.length <= 10 &&
            editsMade() &&
            noErrors() && (
              <button
                className={styles.saveChangesBtn}
                onClick={handleSaveChanges}
              >
                Save Changes <i className="bi bi-floppy"></i>
              </button>
            )}
          <textarea
            defaultValue={post?.description}
            onChange={handleDescriptionChange}
          />
          {descriptionEditError && (
            <p className={styles.errorP}>{descriptionEditError}</p>
          )}
          <input
            type="number"
            defaultValue={post?.price}
            onChange={handlePriceChange}
          />
          {priceEditError && <p className={styles.errorP}>{priceEditError}</p>}
          <input
            type="text"
            defaultValue={post?.location}
            onChange={handleLocationChange}
          />
          {locationEditError && (
            <p className={styles.errorP}>{locationEditError}</p>
          )}
          <div
            className={styles.editPicturesContainer}
            ref={editPicturesContainerRef}
          >
            {pictureEditError && (
              <p className={styles.errorP}>{pictureEditError}</p>
            )}
            {newPictures.length <= 10 && (
              <button className={styles.addPicture} onClick={addPicture}>
                <i className="bi bi-plus"></i>
              </button>
            )}
            {newPictures.map((picture, index) =>
              editPictureDisplay(index, picture.url)
            )}
          </div>
        </div>
      )}
      {isLoggedIn &&
        (user?.id === creator?.id ||
          user?.roles.some((role) => role.name === "ROLE_ADMIN")) && (
          <div className={styles.postControls}>
            {creator?.id === user?.id && (
              <button
                className={styles.editPostBtn}
                onClick={startOrDiscardEdit}
              >
                {showEditOptions ? (
                  <>
                    Discard Changes <i className="bi bi-x-lg"></i>
                  </>
                ) : (
                  <>
                    Edit Post <i className="bi bi-pen"></i>
                  </>
                )}
              </button>
            )}
            <button className={styles.deletePostBtn} onClick={handleDeletePost}>
              Delete Post <i className="bi bi-trash3"></i>
            </button>
          </div>
        )}
    </>
  );
};

export default PostDetails;
