import jwt from "jsonwebtoken"

const createJWTTOkenUser = (userId)=>{
    const token = jwt.sign(
        {userId:userId},
        process.env.JWT_SECRET,
        {expiresIn:"2d"},
    )
    return token
}
const verifyJWTToken = (token)=>{
    try {
        const payload = jwt.verify(token,process.env.JWT_SECRET);
        return payload;
    } catch (error) {
        console.log(error);
        return null;
    }
}
export {createJWTTOkenUser, verifyJWTToken}

