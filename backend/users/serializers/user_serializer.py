from rest_framework import serializers
from django.contrib.auth.models import User
from users.models.user import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            "id", "name", "email", "password",
            # Basic Information
            "gender", "phone_number", "date_of_birth", "hobbies",
            # Education
            "highest_qualification", "field_of_study", "passed_out_year",
            # Skills and Experience
            "technical_skills", "soft_skills", "interests", "experience",
            # Career Assessment
            "core_work_passion", "learning_style", "work_environment",
            "key_strength", "motivation_driver", "decision_style",
            "interest_domain", "values_lifestyle",
            # System fields
            "created_at", "updated_at"
        ]
        extra_kwargs = {
            "password": {"write_only": True, "required": False},
            "email": {"required": False},
            "date_of_birth": {"required": False},
            "gender": {"required": False},
            "phone_number": {"required": False},
            "hobbies": {"required": False},
            "highest_qualification": {"required": False},
            "field_of_study": {"required": False},
            "passed_out_year": {"required": False},
            "technical_skills": {"required": False},
            "soft_skills": {"required": False},
            "interests": {"required": False},
            "experience": {"required": False},
            "core_work_passion": {"required": False},
            "learning_style": {"required": False},
            "work_environment": {"required": False},
            "key_strength": {"required": False},
            "motivation_driver": {"required": False},
            "decision_style": {"required": False},
            "interest_domain": {"required": False},
            "values_lifestyle": {"required": False}
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make all fields optional for PATCH requests
        if self.context.get('request') and self.context['request'].method == 'PATCH':
            for field in self.fields:
                self.fields[field].required = False
        # For POST requests (create), make required fields mandatory
        elif self.context.get('request') and self.context['request'].method == 'POST':
            required_fields = [
                'name', 'email', 'password', 'gender', 'phone_number', 'date_of_birth',
                'hobbies', 'highest_qualification', 'passed_out_year', 'technical_skills',
                'soft_skills', 'interests', 'core_work_passion', 'learning_style',
                'work_environment', 'key_strength', 'motivation_driver', 'decision_style',
                'interest_domain', 'values_lifestyle'
            ]
            for field in required_fields:
                if field in self.fields:
                    self.fields[field].required = True
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Remove password from response
        representation.pop('password', None)
        return representation