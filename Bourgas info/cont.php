<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Untitled Document</title>
</head>

<body>
<?php echo "Лична информация:";
$name = $_POST['name'];
if  ($_POST["name"] !="") echo "<p>Въведете  име:".$_POST["name"]."</p>";
 else echo "<p> Не е въведено име!</p>";
 
 $name = $_POST['phone'];
 if  ($_POST["phone"] !="") echo "<p>Телефонен номер:".$_POST["phone"]."</p>";
 else echo "<p> Не е въведен телефонен номер!</p>";
 
 $name = $_POST['web'];
 if  ($_POST["web"] !="") echo "<p>Въведете  web site:".$_POST["web"]."</p>";
 else echo "<p> Не е въведен web site!</p>";
 
 $name = $_POST['email'];
 if  ($_POST["email"] !="") echo "<p> Въведете  E-mail:".$_POST["email"]."</p>";
 else echo "<p> Не е въведен E-mail</p>";
 
?>
 <a href="javascript:history.back()">Назад</a>
</body>
</html>