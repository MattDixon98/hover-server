import React from "react";

type ProfileProps = {
  img: string,
  name: string
}

function Profile(props: ProfileProps) {
  return(
    <div>
      <img src={props.img} alt="user"/>
      <p> {props.name} </p>
    </div>
  )
}

export default Profile;