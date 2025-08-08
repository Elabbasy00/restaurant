from django.db import models
from django.utils import timezone
from django.db.models.query import F, Q


class BaseModel(models.Model):
    created_at = models.DateTimeField(db_index=True, default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SimpleModel(models.Model):
    """
    This is a basic model used to illustrate a many-to-many relationship
    with RandomModel.
    """

    name = models.CharField(max_length=255, blank=True, null=True)


class RandomModel(BaseModel):
    """
    This is an example model, to be used as reference in the test,
    """

    start_date = models.DateField()
    end_date = models.DateField()

    simple_objects = models.ManyToManyField(SimpleModel, blank=True, related_name="random_objects")

    class Meta:
        constraints = [models.CheckConstraint(name="start_date_before_end_date", check=Q(start_date__lt=F("end_date")))]
