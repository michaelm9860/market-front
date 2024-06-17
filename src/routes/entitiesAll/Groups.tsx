import { useContext, useEffect, useState } from "react";
import { Group } from "../../@types/Group";
import { GroupsList } from "../../@types/GroupsList";
import Card from "../../components/card/Card";
import CardsDisplay from "../../components/card/CardsDisplay";
import { AuthContext } from "../../contexts/AuthContext";
import { GroupsService } from "../../services/groups-service";
import { Dialogues } from "../../ui/Dialogues";
import styles from "./entitiesAll.module.scss";

const Groups = () => {
  const { isLoggedIn } = useContext(AuthContext);

  const [groupsPage, setGroupsPage] = useState<Group[]>();

  const [currentPage, setCurrentPage] = useState<number>(0);

  const [lastPage, setLastPage] = useState<number>();

  const getAllGroups = async (pageNum: number) => {
    try {
      const groups: GroupsList = await GroupsService.getAllGroups(pageNum, 12);
      setGroupsPage(groups.userGroups);
      setLastPage(groups.totalPages);
    } catch (error: any) {
      try {
        const errorData = JSON.parse(error.message);
        Dialogues.error(errorData.message);
      } catch (parseError) {
        Dialogues.error();
      }
    }
  };

  useEffect(() => {
    getAllGroups(0);
  }, []);


  const nextPage = () => {
    if (lastPage) {
      if (currentPage < lastPage -1) {
        getAllGroups(currentPage + 1);
        setCurrentPage(currentPage + 1);
      }
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      getAllGroups(currentPage - 1);
      setCurrentPage(currentPage - 1);
    }
  };

  if (!isLoggedIn) {
    return (
      <>
        <h2 className={styles.notLogged}>Must be logged in to see groups</h2>
      </>
    );
  } else {
    return (
      <div className={styles.pageContainer}>
        <h2>All Groups</h2>
        <CardsDisplay>
          {groupsPage?.map((group) => (
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
        <div className={styles.btnContainer}>
          <button onClick={nextPage}><i className="bi bi-chevron-double-left"></i></button>
          <button onClick={prevPage}><i className="bi bi-chevron-double-right"></i></button>
        </div>
      </div>
    );
  }
};

export default Groups;
