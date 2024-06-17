import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { LoginRequest } from "../../@types/LoginRequest";
import { Auth } from "../../services/auth-service";
import { Dialogues } from "../../ui/Dialogues";
import styles from "./Login.module.scss";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>();

  const onSubmit = async (data: LoginRequest) => {
    try {
      const res = await Auth.login(data);

      Dialogues.success("Login successful.");
      login(res.jwt, res.user);
      navigate("/");
    } catch (error: any) {
      let errorData;
      try {
        errorData = JSON.parse(error.message);
      } catch (parseError) {
        Dialogues.error("An error occurred. Please try again later.");
        return;
      }

      if (errorData && errorData.message) {
        Dialogues.error(errorData.message);
      } else {
        Dialogues.error("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3>Login</h3>
      <form
        className={styles.loginForm}
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <input
          type="email"
          autoComplete="email"
          placeholder="Email"
          className={styles.loginInputField}
          {...register("email", { required: "Email is required" })}
        />
        {errors.email && (
          <p className={styles.errorP}>{errors.email.message}</p>
        )}
        <input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          className={styles.loginInputField}
          {...register("password", { required: "Password is required" })}
        />
        {errors.password && (
          <p className={styles.errorP}>{errors.password.message}</p>
        )}
        <button className={styles.submitBtn} type="submit">
          Login
        </button>
        <p className={styles.goToRegister}>
          Don't have an acount? create one <Link to="/register"> here.</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
