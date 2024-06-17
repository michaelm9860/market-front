import styles from "./About.module.scss";

const About = () => {
  return (
    <div className={styles.about}>
      <h2>About Digital Market Place</h2>
      <p>
        Welcome to Digital Marketplace, a vibrant platform where users can buy
        and sell items effortlessly. Whether you have something to sell or are
        looking to purchase, Digital Marketplace is the place for you.
        <br />
        Users can post their items for sale and be contacted by interested
        buyers directly through our platform. Additionally, you can explore and
        join various groups tailored to specific communities, allowing for
        targeted buying and selling within niche markets. Whether you're looking
        to declutter your space or find unique items, our community-driven
        marketplace makes it easy and enjoyable.
        <br />
        Buy and sell with ease, create and join groups, and establish
        communities in Digital Marketplace.
      </p>
      <h3>Post items for sale and contact other sellers</h3>
      <p>
        Selling items is simple and straightforward on Digital Marketplace.
        <br />
        Post your items for sale and be contacted by interested buyers directly.
        You can easily manage your listings and be connected directly with buyers, making
        the selling process efficient and convenient.
      </p>
      <h3>Join groups and explore niche markets</h3>
      <p>
        Join groups tailored to specific communities and interests to explore
        niche markets and connect with like-minded individuals.
        <br />
        Whether you're looking to buy or sell, groups provide a platform for
        targeted interactions and transactions within specific communities.
      </p>
    </div>
  );
};

export default About;
