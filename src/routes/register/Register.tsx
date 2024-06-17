import { useForm } from "react-hook-form";
import styles from "./Register.module.scss";
import { RegisterRequest } from "../../@types/RegisterRequest";
import { Auth } from "../../services/auth-service";
import { useState } from "react";
import { Dialogues } from "../../ui/Dialogues";
import { Link, useNavigate } from "react-router-dom";

const defaultProfilePicture = "/public/assets/default_user_pfp.jpg";
const maxPictureSize = 10 * 1024 * 1024; // 10 MB

const Register = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    formState: { errors, dirtyFields },
    handleSubmit,
    watch,
    resetField,
    setError,
  } = useForm<RegisterRequest>({
    mode: "onChange",
  });

  const getClassNames = (fieldName: keyof RegisterRequest) => {
    if (errors[fieldName]) {
      return `${styles.registerInputField} ${styles.invalidInputField}`;
    } else if (dirtyFields[fieldName]) {
      return `${styles.registerInputField} ${styles.validInputField}`;
    } else {
      return styles.registerInputField;
    }
  };

  const onSubmit = async (data: RegisterRequest) => {
    const formData = new FormData();
    formData.append(
      "user",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );

    if (data.profilePictureFile && data.profilePictureFile[0]) {
      formData.append("profilePictureFile", data.profilePictureFile[0]);
    } else {
      const defaultFile = await fetch(defaultProfilePicture).then((res) =>
        res.blob()
      );
      formData.append(
        "profilePictureFile",
        defaultFile,
        "defaultProfilePicture.jpg"
      );
    }

    try {
      await Auth.register(formData);
      await Dialogues.success("Registration successful. Go to login.")
      navigate("/login");
    } catch (error: any) {
      let errorData;
      try {
        errorData = JSON.parse(error.message);
      } catch (parseError) {
        Dialogues.error();
        return;
      } 
      if(errorData.message){
        const message = errorData.message.toLowerCase();
        if(message.includes("email")){
          setError("email", { type: "manual", message: errorData.message })
        }else if(message.includes("phone number")){
          setError("phoneNumber", { type: "manual", message: errorData.message })
        } else{
          Dialogues.error(errorData.message)
        }
      }else{
        Dialogues.error()
      }
    }
  };

  const removeFile = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation(); 
    setFileName(null);
    resetField("profilePictureFile");
  };

  return (
    <div className={styles.formContainer}>
      <h3>Register</h3>
      <form
        className={styles.registerForm}
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <input
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: "Invalid email format",
            },
          })}
          type="email"
          autoComplete="email"
          placeholder="Email"
          className={getClassNames("email")}
        />
        {errors.email && (
          <p className={styles.errorP}>{errors.email.message}</p>
        )}

        <input
          {...register("phoneNumber", {
            required: "Phone number is required",
            pattern: {
              value: /^\+\d{1,15}$/,
              message:
                'Invalid phone number format. Must start with "+" and contain only digits',
            },
          })}
          type="tel"
          autoComplete="tel"
          placeholder="Phone number with country code (e.g. +1234567890)"
          className={getClassNames("phoneNumber")}
        />
        {errors.phoneNumber && (
          <p className={styles.errorP}>{errors.phoneNumber.message}</p>
        )}

        <input
          {...register("firstName", {
            required: "First name is required",
            minLength: {
              value: 2,
              message: "First name must be at least 2 characters",
            },
            maxLength: {
              value: 24,
              message: "First name must be at most 24 characters",
            },
          })}
          type="text"
          autoComplete="given-name"
          placeholder="First Name"
          className={getClassNames("firstName")}
        />
        {errors.firstName && (
          <p className={styles.errorP}>{errors.firstName.message}</p>
        )}

        <input
          {...register("lastName", {
            required: "Last name is required",
            minLength: {
              value: 2,
              message: "Last name must be at least 2 characters",
            },
            maxLength: {
              value: 24,
              message: "Last name must be at most 24 characters",
            },
          })}
          type="text"
          autoComplete="family-name"
          placeholder="Last Name"
          className={getClassNames("lastName")}
        />
        {errors.lastName && (
          <p className={styles.errorP}>{errors.lastName.message}</p>
        )}

        <input
          {...register("location", {
            required: "Location is required",
            minLength: {
              value: 2,
              message: "Location must be at least 2 characters",
            },
            maxLength: {
              value: 32,
              message: "Location must be at most 32 characters",
            },
          })}
          type="text"
          placeholder="Your location (City, Country, etc.)"
          className={getClassNames("location")}
        />
        {errors.location && (
          <p className={styles.errorP}>{errors.location.message}</p>
        )}

        <input
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
            maxLength: {
              value: 20,
              message: "Password must be at most 20 characters",
            },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,20}$/,
              message:
                "password must contain at least 1 lowercase letter, 1 uppercase letter, 1 digit and 1 special character",
            },
          })}
          type="password"
          autoComplete="new-password"
          placeholder="Create a strong password"
          className={getClassNames("password")}
        />
        {errors.password && (
          <p className={styles.errorP}>{errors.password.message}</p>
        )}

        <input
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) =>
              value === watch("password") || "Passwords do not match",
          })}
          type="password"
          autoComplete="new-password"
          placeholder="Confirm Password"
          className={getClassNames("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className={styles.errorP}>{errors.confirmPassword.message}</p>
        )}

        <input
          type="file"
          accept="image/*"
          id="profilePictureFile"
          className={styles.inputFile}
          {...register("profilePictureFile", {
            validate: (value: FileList | undefined) => {
              const file = value && value[0];
              if (file && file.size >= maxPictureSize) {
                return "File size should be less than 10MB";
              }
              return true;
            },
            onChange: (e) => {
              const file = e.target.files?.[0];
              if (file) {
                setFileName(file.name);
              } else {
                setFileName(null);
              }
            },
          })}
        />
        <label htmlFor="profilePictureFile" className={styles.inputFileLabel}>
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
              <span>Select profile
              picture (optional)</span>
              <i className="bi bi-cloud-arrow-up-fill"></i>
            </>
          )}
        </label>

        {errors.profilePictureFile && (
          <p className={styles.errorP}>{errors.profilePictureFile.message}</p>
        )}

        <button className={styles.submitBtn} type="submit">
          Register
        </button>
        <p className={styles.goToLogin}>Already have an acount? <Link to="/login"> log in</Link> instead.</p>
      </form>
    </div>
  );
};

export default Register;
