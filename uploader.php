<?php
$image = $_FILES['image']['name'];
$upload_path = 'uploads/';
$upload_file = $upload_path . basename($image);
if (move_uploaded_file($_FILES['image']['tmp_name'], $upload_file)) {
    echo $upload_file;
} else {
    echo 'lorem ipsum';
}
