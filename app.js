$(function() {
	$('#summernote').summernote({
        fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New'],
        height: 200,
        ace: {
			aceTheme: 'ace/theme/github',
			aceMode: 'php',
			aceLineHeight: '20px',
			aceFontSize: '14px',
			aceModeSelectorLabel: 'Language',
			aceCodeInputAreaLabel: 'Type in code',
			aceCodeSubmitBtnLabel: 'Insert',
			aceModalTitle: 'Insert Code',
			aceModes: [
                'php', 'javascript', 'sql','sh',
                'java','python', 'ruby', 'golang',
                'coffee', 'typescript'
			],
		},
		toolbar: [
			['handy', ['style']],
            ['fonts', ['fontname', 'fontsize']],
            ['color', ['color']],
            ['para', ['ul', 'ol',  'paragraph']],
            ['inserts', ['picture', 'link', 'video', 'hr']],
            ['codeEditor', ['aceCodeEditor']],
		],
        callbacks : {
            onImageUpload: function (image) {
                uploadImage(image[0]);
            }
        }
	});
    var IMAGE_PATH = 'http://summernote.dev/';

    function uploadImage(image) {
        var data = new FormData();
        data.append("image",image);
        $.ajax ({
            data: data,
            type: "POST",
            url: "./uploader.php",
            cache: false,
            contentType: false,
            processData: false,
            success: function(url) {
                var image = IMAGE_PATH + url;
                $('#summernote').summernote("insertImage", image);
            },
            error: function(data) {
                console.log(data);
            }
        });
    }

});
