import { render } from "@react-email/render";
import UpdateStatus from "../../../emails/UpdateStatus";
import { sendEmail } from "../../utils/email";

export default async function handler(
  req,
  res
) {
  console.log(req.body)
  await sendEmail({
    to: "etimpaul22@gmail.com",
    subject: "",
    html: render(UpdateStatus()),
  });

  return res.status(200).json({ message: "Email sent successfully" });
}